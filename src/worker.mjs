import { createTask, validateTask, authorizeExecution } from './core.mjs';

const MAX_BODY_BYTES = 32 * 1024;
const json = (body, status = 200) => new Response(JSON.stringify(body, null, 2), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
const bearerMatches = (request, token) => Boolean(token) && request.headers.get('authorization') === `Bearer ${token}`;

async function readJsonBounded(request) {
  const declared = Number(request.headers.get('content-length') ?? 0);
  if (declared > MAX_BODY_BYTES) return { error: 'payload_too_large' };
  const raw = await request.text();
  if (new TextEncoder().encode(raw).byteLength > MAX_BODY_BYTES) return { error: 'payload_too_large' };
  try { return { value: JSON.parse(raw) }; } catch { return { error: 'invalid_json' }; }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'GET' && url.pathname === '/health') {
      return json({ ok: true, service: 'capital-king-task-engine', mode: 'safe', executionEnabled: env.EXECUTION_MODE === 'enabled', cloudflareBindingsConfigured: Boolean(env.DB && env.TASK_QUEUE) });
    }

    if (request.method === 'POST' && url.pathname === '/events/task') {
      if (!env.INGEST_TOKEN) return json({ error: 'ingress_not_configured' }, 503);
      if (!bearerMatches(request, env.INGEST_TOKEN)) return json({ error: 'unauthorized' }, 401);
      const parsed = await readJsonBounded(request);
      if (parsed.error) return json({ error: parsed.error }, parsed.error === 'payload_too_large' ? 413 : 400);
      const check = validateTask(parsed.value);
      if (!check.ok) return json({ error: 'invalid_task', details: check.errors }, 422);
      const task = createTask(parsed.value);
      const inserted = await env.DB.prepare(`INSERT OR IGNORE INTO tasks (id,dedupe_key,title,department,source,event_id,task_type,priority,payload_json,action,approval_required,approval_status,status,retry_count,max_retries,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
        .bind(task.id, task.dedupeKey, task.title, task.department, task.source, task.eventId, task.taskType, task.priority, JSON.stringify(task.payload), task.action, task.approvalRequired ? 1 : 0, task.approvalStatus, task.status, task.retryCount, task.maxRetries, task.createdAt, task.updatedAt).run();
      const row = await env.DB.prepare('SELECT id,status,dedupe_key FROM tasks WHERE dedupe_key = ?').bind(task.dedupeKey).first();
      if (!row) return json({ error: 'task_persistence_unconfirmed' }, 503);
      await env.DB.prepare('INSERT INTO audit_log (task_id,event_type,details_json,created_at) VALUES (?,?,?,?)').bind(row.id, inserted.meta?.changes ? 'task_created' : 'duplicate_event_ignored', JSON.stringify({ source: task.source, eventId: task.eventId }), new Date().toISOString()).run();
      if (inserted.meta?.changes && task.status === 'pending' && env.EXECUTION_MODE === 'enabled') await env.TASK_QUEUE.send({ taskId: task.id });
      return json({ accepted: true, duplicate: !inserted.meta?.changes, executionQueued: Boolean(inserted.meta?.changes && task.status === 'pending' && env.EXECUTION_MODE === 'enabled'), task: row }, inserted.meta?.changes ? 202 : 200);
    }

    const approvalPathId = url.pathname.startsWith('/approvals/') ? url.pathname.slice('/approvals/'.length) : '';
    const approvalMatch = /^[0-9a-f-]{36}$/i.test(approvalPathId) ? approvalPathId : null;
    if (request.method === 'POST' && approvalMatch) {
      if (!env.ADMIN_TOKEN) return json({ error: 'approval_management_not_configured' }, 503);
      if (!bearerMatches(request, env.ADMIN_TOKEN)) return json({ error: 'unauthorized' }, 401);
      const parsed = await readJsonBounded(request);
      if (parsed.error) return json({ error: parsed.error }, parsed.error === 'payload_too_large' ? 413 : 400);
      const body = parsed.value;
      if (!body || body.decision !== 'approve' || typeof body.approvedBy !== 'string' || !body.approvedBy.trim() || typeof body.approvalId !== 'string' || !body.approvalId.trim()) return json({ error: 'invalid_approval' }, 422);
      const task = await env.DB.prepare('SELECT id,status,action,approval_required FROM tasks WHERE id = ?').bind(approvalMatch[1]).first();
      if (!task) return json({ error: 'task_not_found' }, 404);
      if (!task.approval_required || task.status !== 'awaiting_approval') return json({ error: 'task_not_awaiting_approval' }, 409);
      const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      const approval = { taskId: task.id, status: 'approved', approvedBy: body.approvedBy.trim(), approvalId: body.approvalId.trim(), action: task.action, scope: body.scope, expiresAt };
      const check = authorizeExecution({ id: task.id, status: task.status, approvalRequired: true, action: task.action }, approval);
      if (!check.allowed) return json({ error: check.reason }, 422);
      await env.DB.prepare('INSERT INTO approvals (approval_id,task_id,status,approved_by,scope,action,expires_at,created_at) VALUES (?,?,?,?,?,?,?,?)').bind(approval.approvalId, task.id, 'approved', approval.approvedBy, approval.scope, approval.action, approval.expiresAt, new Date().toISOString()).run();
      await env.DB.prepare("UPDATE tasks SET approval_status='approved',status='pending',updated_at=? WHERE id=? AND status='awaiting_approval'").bind(new Date().toISOString(), task.id).run();
      if (env.EXECUTION_MODE === 'enabled') await env.TASK_QUEUE.send({ taskId: task.id });
      return json({ approved: true, taskId: task.id, scope: task.action, expiresAt: approval.expiresAt, executionQueued: env.EXECUTION_MODE === 'enabled' }, 200);
    }

    return json({ error: 'not_found' }, 404);
  }
};
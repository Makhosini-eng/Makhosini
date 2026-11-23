import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

function approvalEnv() {
  const task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    status: 'awaiting_approval',
    action: 'publish_content',
    approval_required: 1,
    approval_status: 'required'
  };
  const approvals = [];
  const audit = [];
  let batchTail = Promise.resolve();

  const DB = {
    prepare(sql) {
      let values = [];
      const statement = {
        bind(...args) { values = args; return this; },
        async first() {
          if (sql.includes('FROM tasks WHERE id')) return task.id === values[0] ? { ...task } : null;
          throw new Error('Unexpected SQL: ' + sql);
        },
        async run() {
          if (sql.includes('INSERT INTO approvals')) {
            const [approvalId, approvedBy, scope, expiresAt, createdAt, taskId, action] = values;
            if (task.id === taskId && task.status === 'awaiting_approval' &&
                task.approval_required === 1 && task.action === action &&
                !approvals.some(item => item.approval_id === approvalId)) {
              approvals.push({ approval_id: approvalId, task_id: taskId, approved_by: approvedBy, scope, action, expires_at: expiresAt, created_at: createdAt });
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes('UPDATE tasks SET approval_status')) {
            const [updatedAt, taskId, action, approvalId, expiresAt] = values;
            const claim = approvals.find(item => item.approval_id === approvalId && item.task_id === taskId &&
              item.action === action && item.scope === action && item.expires_at === expiresAt);
            if (task.id === taskId && task.status === 'awaiting_approval' && task.action === action && claim) {
              task.status = 'pending';
              task.approval_status = 'approved';
              task.updated_at = updatedAt;
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          if (sql.includes('INSERT INTO audit_log')) {
            const [taskId, details, createdAt, approvalId, expectedTaskId] = values;
            if (task.id === taskId && task.id === expectedTaskId && approvals.some(item => item.approval_id === approvalId)) {
              audit.push({ task_id: taskId, details, created_at: createdAt });
              return { meta: { changes: 1 } };
            }
            return { meta: { changes: 0 } };
          }
          throw new Error('Unexpected SQL: ' + sql);
        }
      };
      return statement;
    },
    batch(statements) {
      const run = batchTail.then(async () => {
        const results = [];
        for (const statement of statements) results.push(await statement.run());
        return results;
      });
      batchTail = run.catch(() => {});
      return run;
    }
  };

  return {
    DB,
    ADMIN_TOKEN: 'admin-secret-for-tests',
    EXECUTION_MODE: 'disabled',
    TASK_QUEUE: { async send() { throw new Error('Queue must remain disabled in this test'); } },
    state: { task, approvals, audit }
  };
}

function approvalRequest(taskId, approvalId) {
  return new Request('https://local.test/approvals/' + taskId, {
    method: 'POST',
    headers: { authorization: 'Bearer admin-secret-for-tests', 'content-type': 'application/json' },
    body: JSON.stringify({ decision: 'approve', approvedBy: 'test-operator', approvalId, scope: 'publish_content' })
  });
}

test('oversized streamed request is cancelled before the whole body is buffered', async () => {
  let cancelled = false;
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode('{"payload":"' + 'x'.repeat(40 * 1024) + '"}'));
    },
    cancel() { cancelled = true; }
  });
  const request = new Request('https://local.test/events/task', {
    method: 'POST',
    headers: { authorization: 'Bearer ingest-secret', 'content-type': 'application/json' },
    body: stream,
    duplex: 'half'
  });
  const response = await worker.fetch(request, { INGEST_TOKEN: 'ingest-secret' });
  assert.equal(response.status, 413);
  assert.equal(cancelled, true);
});

test('invalid UTF-8 request body is rejected without reaching persistence', async () => {
  const stream = new ReadableStream({
    start(controller) { controller.enqueue(new Uint8Array([0xc3, 0x28])); controller.close(); }
  });
  const request = new Request('https://local.test/events/task', {
    method: 'POST',
    headers: { authorization: 'Bearer ingest-secret', 'content-type': 'application/json' },
    body: stream,
    duplex: 'half'
  });
  const response = await worker.fetch(request, { INGEST_TOKEN: 'ingest-secret' });
  assert.equal(response.status, 400);
  assert.equal((await response.json()).error, 'invalid_utf8');
});

test('approval claim, task transition and audit event are committed as one batch', async () => {
  const env = approvalEnv();
  const response = await worker.fetch(approvalRequest(env.state.task.id, 'approval-atomic-001'), env);
  assert.equal(response.status, 200);
  assert.equal(env.state.task.status, 'pending');
  assert.equal(env.state.task.approval_status, 'approved');
  assert.equal(env.state.approvals.length, 1);
  assert.equal(env.state.audit.length, 1);
});

test('concurrent approval requests cannot approve the same task twice', async () => {
  const env = approvalEnv();
  const [first, second] = await Promise.all([
    worker.fetch(approvalRequest(env.state.task.id, 'approval-race-001'), env),
    worker.fetch(approvalRequest(env.state.task.id, 'approval-race-002'), env)
  ]);
  assert.deepEqual([first.status, second.status].sort(), [200, 409]);
  assert.equal(env.state.task.status, 'pending');
  assert.equal(env.state.approvals.length, 1);
  assert.equal(env.state.audit.length, 1);
});

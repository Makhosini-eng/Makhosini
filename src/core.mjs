import { randomUUID, createHash } from 'node:crypto';

export const DEPARTMENTS = Object.freeze(['product', 'customer', 'operations']);
export const STATUSES = Object.freeze(['pending', 'running', 'awaiting_approval', 'blocked', 'completed', 'failed', 'cancelled', 'dead_letter']);
export const APPROVAL_ACTIONS = Object.freeze(['spend_money', 'publish_content', 'contact_external_party', 'change_account_settings', 'grant_permissions', 'deploy_live_system', 'handle_payment', 'delete_or_overwrite_live_data']);
export const SAFE_ACTIONS = Object.freeze(['internal_work', 'research', 'draft', 'create_local_artifact', 'run_quality_checks', 'market_research', 'competitor_research', 'qualify_prospects', 'draft_outreach', 'reconcile_supplied_records', 'audit_workflows', 'prepare_reports', 'escalate_failures']);

const safeString = (v, max = 500) => typeof v === 'string' && v.trim().length > 0 && v.length <= max;

export function stableTaskKey({ source, eventId, taskType, subject }) {
  const basis = JSON.stringify([source, eventId, taskType, subject ?? '']);
  return createHash('sha256').update(basis).digest('hex');
}

export function validateTask(input) {
  const errors = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) return { ok: false, errors: ['Task must be an object'] };
  if (!safeString(input.title, 180)) errors.push('title must be a non-empty string up to 180 characters');
  if (!DEPARTMENTS.includes(input.department)) errors.push(`department must be one of: ${DEPARTMENTS.join(', ')}`);
  if (!safeString(input.source, 80)) errors.push('source must be a non-empty string up to 80 characters');
  if (!safeString(input.eventId, 180)) errors.push('eventId must be a non-empty string up to 180 characters');
  if (!safeString(input.taskType, 100)) errors.push('taskType must be a non-empty string up to 100 characters');
  if (input.priority !== undefined && !['low', 'normal', 'high', 'critical'].includes(input.priority)) errors.push('priority must be low, normal, high or critical');
  if (input.action !== undefined && !SAFE_ACTIONS.includes(input.action) && !APPROVAL_ACTIONS.includes(input.action)) errors.push('action is not in the approved action catalogue');
  if (input.approvalRequired !== undefined && typeof input.approvalRequired !== 'boolean') errors.push('approvalRequired must be a boolean');
  if (input.maxRetries !== undefined && (!Number.isInteger(input.maxRetries) || input.maxRetries < 0 || input.maxRetries > 3)) errors.push('maxRetries must be an integer from 0 to 3');
  if (input.payload !== undefined && (input.payload === null || typeof input.payload !== 'object' || Array.isArray(input.payload))) errors.push('payload must be a JSON object');
  return { ok: errors.length === 0, errors };
}

export function requiresApproval(action) {
  return APPROVAL_ACTIONS.includes(action);
}

export function createTask(input, now = new Date().toISOString()) {
  const validation = validateTask(input);
  if (!validation.ok) throw new Error(`Invalid task: ${validation.errors.join('; ')}`);
  const id = randomUUID();
  const dedupeKey = stableTaskKey(input);
  const approvalRequired = Boolean(input.approvalRequired || requiresApproval(input.action));
  return {
    id, dedupeKey, title: input.title.trim(), department: input.department,
    source: input.source, eventId: input.eventId, taskType: input.taskType,
    priority: input.priority ?? 'normal', payload: input.payload ?? {},
    action: input.action ?? 'internal_work', approvalRequired,
    approvalStatus: approvalRequired ? 'required' : 'not_required',
    status: approvalRequired ? 'awaiting_approval' : 'pending',
    retryCount: 0, maxRetries: input.maxRetries ?? 2, createdAt: now, updatedAt: now
  };
}

export function authorizeExecution(task, approval = null, now = Date.now()) {
  if (!task) return { allowed: false, reason: 'task_not_found' };
  if (['cancelled', 'completed', 'dead_letter', 'blocked'].includes(task.status)) return { allowed: false, reason: `terminal_status:${task.status}` };
  if (task.approvalRequired) {
    if (!approval || approval.status !== 'approved' || !safeString(approval.approvedBy, 120) || !safeString(approval.approvalId, 180)) return { allowed: false, reason: 'explicit_human_approval_required' };
    if (approval.taskId !== task.id) return { allowed: false, reason: 'approval_task_mismatch' };
    if (approval.action !== task.action || approval.scope !== task.action) return { allowed: false, reason: 'approval_scope_mismatch' };
    if (!Number.isFinite(Date.parse(approval.expiresAt)) || Date.parse(approval.expiresAt) <= now) return { allowed: false, reason: 'approval_expired_or_invalid' };
  }
  return { allowed: true };
}

export function retryDecision(task, errorClass = 'transient') {
  if (errorClass === 'permanent') return { retry: false, status: 'dead_letter', reason: 'permanent_error' };
  if (task.retryCount >= task.maxRetries) return { retry: false, status: 'dead_letter', reason: 'retry_limit_reached' };
  return { retry: true, status: 'pending', nextRetryCount: task.retryCount + 1, reason: 'bounded_transient_retry' };
}

export function specialistContract(department) {
  const contracts = {
    product: { mission: 'Create and quality-check products and sales assets', allowed: ['research', 'draft', 'create_local_artifact', 'run_quality_checks'], prohibited: ['publish_without_approval', 'spend_without_approval', 'make_income_claims_without_evidence'], output: ['artifact_reference', 'qa_report', 'open_issues', 'recommended_next_step'] },
    customer: { mission: 'Validate demand and prepare customer acquisition work', allowed: ['market_research', 'competitor_research', 'qualify_prospects', 'draft_outreach'], prohibited: ['send_outreach_without_approval', 'purchase_leads_without_approval', 'misrepresent_identity_or_offer'], output: ['evidence_sources', 'qualified_findings', 'draft_assets', 'confidence_and_gaps'] },
    operations: { mission: 'Maintain operational control, evidence and revenue reporting', allowed: ['reconcile_supplied_records', 'audit_workflows', 'prepare_reports', 'escalate_failures'], prohibited: ['change_payment_settings_without_approval', 'delete_live_records_without_approval', 'claim_unverified_revenue'], output: ['run_report', 'exceptions', 'evidence', 'handover'] }
  };
  if (!contracts[department]) throw new Error('Unknown department');
  return contracts[department];
}
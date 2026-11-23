import test from 'node:test';
import assert from 'node:assert/strict';
import { createTask, validateTask, stableTaskKey, authorizeExecution, retryDecision, specialistContract } from '../src/core.mjs';

const base = { title: 'Prepare product QA report', department: 'product', source: 'synthetic-test', eventId: 'evt-001', taskType: 'qa_report', payload: { product: 'demo' } };

test('valid task is accepted and receives stable dedupe key', () => {
  assert.equal(validateTask(base).ok, true);
  assert.equal(stableTaskKey(base), stableTaskKey(base));
  assert.equal(createTask(base).status, 'pending');
});
test('invalid department is rejected', () => assert.equal(validateTask({ ...base, department: 'finance' }).ok, false));
test('repeated source event produces same dedupe key', () => assert.equal(stableTaskKey(base), stableTaskKey({ ...base })));
test('sensitive actions require exact task, action and scope approval', () => {
  const task = createTask({ ...base, action: 'publish_content' });
  assert.equal(task.status, 'awaiting_approval');
  assert.deepEqual(authorizeExecution(task), { allowed: false, reason: 'explicit_human_approval_required' });
  const approval = { status: 'approved', approvedBy: 'owner', approvalId: 'ap-1', taskId: task.id, action: task.action, scope: task.action, expiresAt: new Date(Date.now() + 60_000).toISOString() };
  assert.equal(authorizeExecution(task, approval).allowed, true);
  assert.equal(authorizeExecution(task, { ...approval, taskId: 'wrong-task' }).allowed, false);
  assert.equal(authorizeExecution(task, { ...approval, scope: 'spend_money' }).reason, 'approval_scope_mismatch');
  assert.equal(authorizeExecution(task, { ...approval, expiresAt: new Date(Date.now() - 1000).toISOString() }).reason, 'approval_expired_or_invalid');
});
test('retry policy is bounded and permanent errors are not retried', () => {
  const task = { retryCount: 0, maxRetries: 2 };
  assert.equal(retryDecision(task, 'transient').retry, true);
  assert.equal(retryDecision({ retryCount: 2, maxRetries: 2 }, 'transient').status, 'dead_letter');
  assert.equal(retryDecision(task, 'permanent').retry, false);
});
test('specialist contracts exist and define prohibited actions', () => {
  for (const department of ['product', 'customer', 'operations']) {
    const contract = specialistContract(department);
    assert.ok(contract.mission); assert.ok(contract.prohibited.length > 0); assert.ok(contract.output.length > 0);
  }
});
test('unknown action and invalid retry values are rejected', () => {
  assert.equal(validateTask({ ...base, action: 'run_shell_command' }).ok, false);
  assert.equal(validateTask({ ...base, maxRetries: 999 }).ok, false);
});
test('deduplication key is unambiguous when fields contain delimiters', () => {
  const a = { source: 'x|y', eventId: 'z', taskType: 't' };
  const b = { source: 'x', eventId: 'y|z', taskType: 't' };
  assert.notEqual(stableTaskKey(a), stableTaskKey(b));
});
test('approvalRequired must be boolean and customer draft outreach is allowed', () => {
  assert.equal(validateTask({ ...base, approvalRequired: 'false' }).ok, false);
  assert.equal(validateTask({ ...base, action: 'draft_outreach' }).ok, true);
});

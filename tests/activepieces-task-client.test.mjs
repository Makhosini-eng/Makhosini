import test from 'node:test';
import assert from 'node:assert/strict';
import { createActivepiecesTaskClient } from '../src/adapters/activepieces-task-client.mjs';

const token = 'synthetic-test-token-that-is-long-enough';
const event = { title: 'Review synthetic lawn-care lead', department: 'customer', source: 'activepieces-poc', eventId: 'lead-demo-001', taskType: 'lead_qualification', action: 'qualify_prospects', payload: { leadId: 'synthetic-001', email: 'lead@example.test' } };

function response(body, status = 202) {
  return { ok: status >= 200 && status < 300, status, async json() { return body; } };
}

test('posts a validated event with bearer auth to the fixed task ingress path', async () => {
  let request;
  const client = createActivepiecesTaskClient({ endpoint: 'https://tasks.example.test/base', token, fetchImpl: async (url, options) => { request = { url: String(url), options }; return response({ accepted: true, duplicate: false, task: { id: 'synthetic-task-1', status: 'pending' } }); } });
  const result = await client.createInternalTask(event);
  assert.equal(request.url, 'https://tasks.example.test/events/task');
  assert.equal(request.options.method, 'POST');
  assert.equal(request.options.headers.authorization, `Bearer ${token}`);
  assert.deepEqual(JSON.parse(request.options.body), event);
  assert.equal(result.accepted, true);
  assert.equal(result.duplicate, false);
});

test('returns duplicate acknowledgement without creating a second local action', async () => {
  const client = createActivepiecesTaskClient({ endpoint: 'https://tasks.example.test', token, fetchImpl: async () => response({ accepted: true, duplicate: true, task: { id: 'existing', status: 'pending' } }, 200) });
  assert.equal((await client.createInternalTask(event)).duplicate, true);
});

test('rejects unsafe endpoint protocols and short secrets before network access', () => {
  assert.throws(() => createActivepiecesTaskClient({ endpoint: 'http://tasks.example.test', token }), /HTTPS/);
  assert.throws(() => createActivepiecesTaskClient({ endpoint: 'https://user:pass@tasks.example.test', token }), /credentials/);
  assert.throws(() => createActivepiecesTaskClient({ endpoint: 'https://tasks.example.test', token: 'short' }), /24 characters/);
});

test('rejects malformed and unsupported events before network access', async () => {
  let calls = 0;
  const client = createActivepiecesTaskClient({ endpoint: 'https://tasks.example.test', token, fetchImpl: async () => { calls++; return response({ accepted: true }); } });
  await assert.rejects(client.createInternalTask({ ...event, department: 'finance' }), /department/);
  await assert.rejects(client.createInternalTask({ ...event, action: 'send_email' }), /action catalogue/);
  assert.equal(calls, 0);
});

test('surfaces ingress rejection without logging or retrying', async () => {
  let calls = 0;
  const client = createActivepiecesTaskClient({ endpoint: 'https://tasks.example.test', token, fetchImpl: async () => { calls++; return response({ error: 'unauthorized' }, 401); } });
  await assert.rejects(client.createInternalTask(event), error => error.status === 401 && error.code === 'unauthorized');
  assert.equal(calls, 1);
});

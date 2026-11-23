import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createTask, authorizeExecution } from '../src/core.mjs';

const leads = JSON.parse(await readFile(new URL('../fixtures/synthetic-leads.json', import.meta.url), 'utf8'));

test('POC fixture contains only synthetic, non-routable example.test contacts', () => {
  assert.equal(leads.length, 3);
  for (const lead of leads) {
    assert.match(lead.id, /^lead-synth-/);
    assert.match(lead.email, /@example\.test$/);
    assert.equal(lead.source, 'synthetic-web-form');
  }
});

test('synthetic leads become internal qualification tasks, not outbound messages', () => {
  for (const lead of leads) {
    const task = createTask({
      title: `Qualify synthetic lead: ${lead.company}`,
      department: 'customer',
      source: lead.source,
      eventId: lead.id,
      taskType: 'lead_qualification',
      action: 'qualify_prospects',
      payload: { company: lead.company, service: lead.service, consentToContact: lead.consentToContact }
    });
    assert.equal(task.status, 'pending');
    assert.equal(task.approvalRequired, false);
    assert.equal(task.action, 'qualify_prospects');
    assert.equal(authorizeExecution(task).allowed, true);
  }
});

test('outbound contact action remains blocked until exact human approval', () => {
  const task = createTask({
    title: 'Contact synthetic lead after consent review',
    department: 'customer',
    source: 'synthetic-test',
    eventId: 'lead-synth-002-contact',
    taskType: 'lead_contact',
    action: 'contact_external_party'
  });
  assert.equal(task.status, 'awaiting_approval');
  assert.equal(authorizeExecution(task).allowed, false);
});

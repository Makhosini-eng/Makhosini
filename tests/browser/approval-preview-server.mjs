import { createServer } from 'node:http';
import { createTask, authorizeExecution } from '../../src/core.mjs';

const HOST = '127.0.0.1';
const PORT = 4173;
const ALLOWED_ACTIONS = new Set(['qualify_prospects', 'contact_external_party']);

const page = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>CAPITAL KING approval policy preview</title>
</head>
<body>
  <main>
    <h1>CAPITAL KING task approval preview</h1>
    <p>This local test page creates synthetic tasks only. It never sends messages or performs external actions.</p>
    <label for="event-id">Synthetic event ID</label>
    <input id="event-id" value="browser-poc-001">
    <div>
      <button id="create-internal" type="button">Create internal qualification task</button>
      <button id="create-external" type="button">Create external-contact task</button>
    </div>
    <section aria-live="polite" data-testid="task-result" hidden>
      <h2>Task decision</h2>
      <p>Status: <strong data-testid="task-status"></strong></p>
      <p>Approval required: <strong data-testid="approval-required"></strong></p>
      <p>Execution allowed without approval: <strong data-testid="execution-allowed"></strong></p>
      <p>External action performed: <strong data-testid="execution-performed">false</strong></p>
    </section>
    <p>No external action is performed by this test server.</p>
  </main>
  <script>
    async function createTask(action) {
      const eventId = document.querySelector('#event-id').value;
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ action, eventId })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Task creation failed');
      document.querySelector('[data-testid="task-result"]').hidden = false;
      document.querySelector('[data-testid="task-status"]').textContent = result.status;
      document.querySelector('[data-testid="approval-required"]').textContent = String(result.approvalRequired);
      document.querySelector('[data-testid="execution-allowed"]').textContent = String(result.executionAllowed);
      document.querySelector('[data-testid="execution-performed"]').textContent = String(result.executionPerformed);
    }
    document.querySelector('#create-internal').addEventListener('click', () => createTask('qualify_prospects'));
    document.querySelector('#create-external').addEventListener('click', () => createTask('contact_external_party'));
  </script>
</body>
</html>`;

function sendJson(response, statusCode, value) {
  response.writeHead(statusCode, { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' });
  response.end(JSON.stringify(value));
}

async function readJson(request) {
  let raw = '';
  for await (const chunk of request) {
    raw += chunk;
    if (raw.length > 4096) throw new Error('Request body too large');
  }
  return JSON.parse(raw || '{}');
}

const server = createServer(async (request, response) => {
  if (request.method === 'GET' && request.url === '/health') {
    return sendJson(response, 200, { ok: true, scope: 'localhost-synthetic-test-only' });
  }
  if (request.method === 'GET' && request.url === '/') {
    response.writeHead(200, { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store' });
    return response.end(page);
  }
  if (request.method === 'POST' && request.url === '/api/tasks') {
    try {
      const input = await readJson(request);
      if (!ALLOWED_ACTIONS.has(input.action)) return sendJson(response, 400, { error: 'Action not allowed in test preview' });
      if (typeof input.eventId !== 'string' || !/^browser-poc-[a-zA-Z0-9-]{1,80}$/.test(input.eventId)) {
        return sendJson(response, 400, { error: 'A synthetic browser-poc event ID is required' });
      }
      const task = createTask({
        title: input.action === 'qualify_prospects' ? 'Qualify synthetic lead' : 'Review external-contact request',
        department: 'customer',
        source: 'playwright-local-poc',
        eventId: input.eventId,
        taskType: input.action === 'qualify_prospects' ? 'lead_qualification' : 'lead_contact',
        action: input.action,
        payload: { synthetic: true }
      });
      const decision = authorizeExecution(task);
      return sendJson(response, 201, {
        id: task.id,
        status: task.status,
        approvalRequired: task.approvalRequired,
        executionAllowed: decision.allowed,
        executionPerformed: false
      });
    } catch (error) {
      return sendJson(response, 400, { error: error instanceof Error ? error.message : 'Invalid request' });
    }
  }
  return sendJson(response, 404, { error: 'Not found' });
});

server.listen(PORT, HOST, () => {
  process.stdout.write(`Approval preview listening on http://${HOST}:${PORT}\n`);
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => server.close(() => process.exit(0)));
}

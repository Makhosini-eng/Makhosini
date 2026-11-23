const REQUIRED = ['title', 'department', 'source', 'eventId', 'taskType'];
const DEPARTMENTS = new Set(['product', 'customer', 'operations']);
const ACTIONS = new Set(['internal_work', 'research', 'draft', 'create_local_artifact', 'run_quality_checks', 'market_research', 'competitor_research', 'qualify_prospects', 'draft_outreach', 'reconcile_supplied_records', 'audit_workflows', 'prepare_reports', 'escalate_failures', 'spend_money', 'publish_content', 'contact_external_party', 'change_account_settings', 'grant_permissions', 'deploy_live_system', 'handle_payment', 'delete_or_overwrite_live_data']);

function validateEvent(event) {
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw new TypeError('event must be an object');
  for (const key of REQUIRED) {
    if (typeof event[key] !== 'string' || !event[key].trim()) throw new TypeError(`event.${key} must be a non-empty string`);
  }
  if (!DEPARTMENTS.has(event.department)) throw new TypeError('event.department is not supported');
  if (event.action !== undefined && !ACTIONS.has(event.action)) throw new TypeError('event.action is not in the task action catalogue');
  if (event.payload !== undefined && (!event.payload || typeof event.payload !== 'object' || Array.isArray(event.payload))) throw new TypeError('event.payload must be an object');
  return event;
}

function validateEndpoint(value) {
  let url;
  try { url = new URL(value); } catch { throw new TypeError('endpoint must be an absolute URL'); }
  const local = ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname);
  if (url.protocol !== 'https:' && !(url.protocol === 'http:' && local)) throw new TypeError('endpoint must use HTTPS (HTTP is allowed only for localhost)');
  if (url.username || url.password || url.search || url.hash) throw new TypeError('endpoint must not contain credentials, query parameters or a fragment');
  return url;
}

/** Sends one validated internal task event to the authenticated task-engine ingress.
 * No retries are performed here; callers may safely retry with the same source/eventId,
 * because the task engine deduplicates that stable event identity.
 */
export function createActivepiecesTaskClient({ endpoint, token, fetchImpl = globalThis.fetch }) {
  const base = validateEndpoint(endpoint);
  if (typeof token !== 'string' || token.length < 24) throw new TypeError('token must be a configured secret of at least 24 characters');
  if (typeof fetchImpl !== 'function') throw new TypeError('fetch implementation is required');
  const target = new URL('/events/task', base);

  return Object.freeze({
    async createInternalTask(event) {
      const body = validateEvent(event);
      const response = await fetchImpl(target, {
        method: 'POST',
        headers: { authorization: `Bearer ${token}`, 'content-type': 'application/json', accept: 'application/json' },
        body: JSON.stringify(body),
        redirect: 'error'
      });
      let result;
      try { result = await response.json(); } catch { throw new Error(`task ingress returned non-JSON response (HTTP ${response.status})`); }
      if (!response.ok || result?.accepted !== true) {
        const error = new Error(`task ingress rejected event (HTTP ${response.status})`);
        error.status = response.status;
        error.code = typeof result?.error === 'string' ? result.error : 'task_ingress_rejected';
        throw error;
      }
      return { accepted: true, duplicate: result.duplicate === true, task: result.task ?? null };
    }
  });
}

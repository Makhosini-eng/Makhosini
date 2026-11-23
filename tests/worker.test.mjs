import test from 'node:test';
import assert from 'node:assert/strict';
import worker from '../src/worker.mjs';

function mockEnv() {
  const tasks = new Map(), audit = [], queue = [], approvals = [];
  const DB = { prepare(sql) {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async run() {
        if (sql.startsWith('INSERT OR IGNORE INTO tasks')) {
          const [id,key,title,department,source,eventId,taskType,priority,payload,action,approvalRequired,approvalStatus,status,retryCount,maxRetries,createdAt,updatedAt] = values;
          const exists = [...tasks.values()].some(t => t.dedupe_key === key);
          if (exists) return { meta: { changes: 0 } };
          tasks.set(id,{id,dedupe_key:key,title,department,source,event_id:eventId,task_type:taskType,priority,payload_json:payload,action,approval_required:approvalRequired,approval_status:approvalStatus,status,retry_count:retryCount,max_retries:maxRetries,created_at:createdAt,updated_at:updatedAt});
          return { meta: { changes: 1 } };
        }
        if (sql.startsWith('INSERT INTO audit_log')) { audit.push(values); return { meta: { changes: 1 } }; }
        if (sql.startsWith('INSERT INTO approvals')) { approvals.push(values); return { meta: { changes: 1 } }; }
        if (sql.startsWith('UPDATE tasks SET approval_status')) { const t=tasks.get(values[1]); if(t){t.approval_status='approved';t.status='pending';} return {meta:{changes:t?1:0}}; }
        throw new Error('Unexpected SQL in mock: '+sql);
      },
      async first() {
        if (sql.includes('FROM tasks WHERE dedupe_key')) return [...tasks.values()].find(t=>t.dedupe_key===values[0])??null;
        if (sql.includes('FROM tasks WHERE id')) return tasks.get(values[0])??null;
        throw new Error('Unexpected SQL in mock: '+sql);
      }
    };
  }};
  return { DB, TASK_QUEUE:{async send(message){queue.push(message);}}, INGEST_TOKEN:'test-secret', ADMIN_TOKEN:'admin-secret', EXECUTION_MODE:'disabled', state:{tasks,audit,queue,approvals} };
}
const sample={title:'Create demo QA report',department:'product',source:'test',eventId:'event-42',taskType:'qa',payload:{fixture:true}};
const postTask=(body,token='test-secret')=>new Request('https://local.test/events/task',{method:'POST',headers:{authorization:'Bearer '+token,'content-type':'application/json'},body:JSON.stringify(body)});

test('health endpoint reports safe mode',async()=>{const env=mockEnv();const r=await worker.fetch(new Request('https://local.test/health'),env);assert.equal(r.status,200);assert.equal((await r.json()).integrationsConfigured,false);});
test('task ingress rejects missing bearer token',async()=>{const env=mockEnv();const r=await worker.fetch(new Request('https://local.test/events/task',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(sample)}),env);assert.equal(r.status,401);});
test('valid internal task persists once and execution remains disabled',async()=>{const env=mockEnv();const a=await worker.fetch(postTask(sample),env);const b=await worker.fetch(postTask(sample),env);assert.equal(a.status,202);assert.equal(b.status,200);assert.equal((await b.json()).duplicate,true);assert.equal(env.state.queue.length,0);assert.equal(env.state.audit.length,2);});
test('approval-required task is persisted but never queued',async()=>{const env=mockEnv();const r=await worker.fetch(postTask({...sample,eventId:'approval-event',action:'publish_content'}),env);assert.equal(r.status,202);assert.equal(env.state.queue.length,0);assert.equal([...env.state.tasks.values()][0].status,'awaiting_approval');});
test('invalid task payload is rejected',async()=>{const env=mockEnv();const r=await worker.fetch(postTask({...sample,department:'unknown'}),env);assert.equal(r.status,422);});
test('ingress fails closed when token is not configured',async()=>{const env=mockEnv();delete env.INGEST_TOKEN;const r=await worker.fetch(postTask(sample),env);assert.equal(r.status,503);});
test('ingress rejects oversized payloads',async()=>{const env=mockEnv();const r=await worker.fetch(postTask({...sample,payload:{data:'x'.repeat(33000)}}),env);assert.equal(r.status,413);});
test('approval endpoint rejects mismatched scope',async()=>{const env=mockEnv();const r=await worker.fetch(postTask({...sample,eventId:'scope-event',action:'publish_content'}),env);const taskId=(await r.json()).task.id;const approval=new Request('https://local.test/approvals/'+taskId,{method:'POST',headers:{authorization:'Bearer admin-secret','content-type':'application/json'},body:JSON.stringify({decision:'approve',approvedBy:'owner',approvalId:'approval-1',scope:'spend_money'})});const out=await worker.fetch(approval,env);assert.equal(out.status,422);assert.equal(env.state.queue.length,0);});
// Safe-mode consumer: deliberately blocks execution until a reviewed specialist adapter exists.
export default {
  async queue(batch, env) {
    for (const message of batch.messages) {
      const { taskId } = message.body ?? {};
      if (!taskId) { message.ack(); continue; }
      const task = await env.DB.prepare('SELECT id,status FROM tasks WHERE id = ?').bind(taskId).first();
      if (!task || !['pending', 'running'].includes(task.status)) { message.ack(); continue; }
      await env.DB.prepare("UPDATE tasks SET status='blocked',last_error='specialist_adapter_not_configured',updated_at=? WHERE id=? AND status IN ('pending','running')")
        .bind(new Date().toISOString(), taskId).run();
      await env.DB.prepare('INSERT INTO audit_log (task_id,event_type,details_json,created_at) VALUES (?,?,?,?)')
        .bind(taskId, 'execution_blocked_safe_mode', JSON.stringify({ reason: 'specialist_adapter_not_configured', externalSideEffects: false }), new Date().toISOString()).run();
      message.ack();
    }
  }
};
PRAGMA foreign_keys = ON;
CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  dedupe_key TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  department TEXT NOT NULL CHECK (department IN ('product','customer','operations')),
  source TEXT NOT NULL,
  event_id TEXT NOT NULL,
  task_type TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low','normal','high','critical')),
  payload_json TEXT NOT NULL DEFAULT '{}',
  action TEXT NOT NULL DEFAULT 'internal_work',
  approval_required INTEGER NOT NULL DEFAULT 0 CHECK (approval_required IN (0,1)),
  approval_status TEXT NOT NULL DEFAULT 'not_required' CHECK (approval_status IN ('not_required','required','approved','rejected')),
  status TEXT NOT NULL CHECK (status IN ('pending','running','awaiting_approval','blocked','completed','failed','cancelled','dead_letter')),
  retry_count INTEGER NOT NULL DEFAULT 0,
  max_retries INTEGER NOT NULL DEFAULT 2,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_tasks_status_priority ON tasks(status, priority, created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_department_status ON tasks(department, status);
CREATE TABLE IF NOT EXISTS approvals (
  approval_id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL REFERENCES tasks(id),
  status TEXT NOT NULL CHECK (status IN ('approved','rejected')),
  approved_by TEXT NOT NULL,
  scope TEXT NOT NULL,
  action TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_audit_task_time ON audit_log(task_id, created_at);
CREATE TABLE IF NOT EXISTS dead_letters (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  task_id TEXT NOT NULL,
  reason TEXT NOT NULL,
  details_json TEXT NOT NULL DEFAULT '{}',
  created_at TEXT NOT NULL
);
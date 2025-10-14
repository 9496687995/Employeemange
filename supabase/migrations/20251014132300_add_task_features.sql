/*
  # Add Task Management Features

  1. Modifications
    - Add priority column to tasks
    - Add completed_at column to tasks
    - Add trigger for completed_at timestamp
    - Add indexes for performance

  2. Important Notes
    - Tasks track individual assignments from admin to employees
    - Status changes are timestamped for completion tracking
    - Default status is 'pending' (displayed in red)
    - Completed tasks are displayed in green
    - Percentage calculation based on completed vs total tasks
*/

-- Add priority column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'priority'
  ) THEN
    ALTER TABLE tasks ADD COLUMN priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high'));
  END IF;
END $$;

-- Add completed_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'tasks' AND column_name = 'completed_at'
  ) THEN
    ALTER TABLE tasks ADD COLUMN completed_at timestamptz;
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_tasks_created_by ON tasks(created_by);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

-- Trigger to update completed_at when status changes to completed
CREATE OR REPLACE FUNCTION update_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
    NEW.completed_at = now();
  ELSIF NEW.status = 'pending' AND OLD.status = 'completed' THEN
    NEW.completed_at = NULL;
  END IF;
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_tasks_completed_at ON tasks;
CREATE TRIGGER update_tasks_completed_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_task_completed_at();
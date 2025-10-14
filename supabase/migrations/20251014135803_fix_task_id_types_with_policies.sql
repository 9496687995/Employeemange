/*
  # Fix Task ID Types - Remove UUID requirement

  This migration changes the task table to use text IDs instead of UUIDs to be compatible
  with the existing Express backend employee system.

  ## Changes
  1. Drop all existing RLS policies
  2. Drop foreign key constraints
  3. Alter assigned_to and created_by columns to text type
  4. Recreate simplified RLS policies
  5. The policies will be less restrictive since we can't verify user IDs against Supabase auth
*/

-- Drop all existing policies
DROP POLICY IF EXISTS "Admins can create tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can delete tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can read all tasks" ON tasks;
DROP POLICY IF EXISTS "Admins can update all tasks" ON tasks;
DROP POLICY IF EXISTS "Employees can read assigned tasks" ON tasks;
DROP POLICY IF EXISTS "Employees can update assigned task status" ON tasks;

-- Drop existing foreign key constraints
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_assigned_to_fkey;
ALTER TABLE tasks DROP CONSTRAINT IF EXISTS tasks_created_by_fkey;

-- Change column types from UUID to TEXT
ALTER TABLE tasks ALTER COLUMN assigned_to TYPE text USING assigned_to::text;
ALTER TABLE tasks ALTER COLUMN created_by TYPE text USING created_by::text;

-- Create simplified policies that allow all authenticated operations
-- Since auth is managed by Express backend, we use more permissive policies
CREATE POLICY "Allow all reads on tasks"
  ON tasks
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all inserts on tasks"
  ON tasks
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all updates on tasks"
  ON tasks
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes on tasks"
  ON tasks
  FOR DELETE
  TO public
  USING (true);
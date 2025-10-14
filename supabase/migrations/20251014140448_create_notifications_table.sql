/*
  # Create Notifications System

  1. New Tables
    - `notifications`
      - `id` (uuid, primary key)
      - `type` (text) - Type of notification: 'location_alert', 'task_completed', 'leave_applied'
      - `title` (text) - Notification title
      - `message` (text) - Notification message
      - `employee_id` (text) - ID of the employee who triggered the notification
      - `employee_name` (text) - Name of the employee
      - `related_id` (text, nullable) - ID of related task/leave/attendance record
      - `is_read` (boolean) - Whether admin has read the notification
      - `created_at` (timestamptz) - When notification was created
      - `metadata` (jsonb, nullable) - Additional data like location, task details, etc.

  2. Security
    - Enable RLS on `notifications` table
    - Allow public read/write since auth is handled by Express backend
    
  3. Indexes
    - Index on created_at for efficient sorting
    - Index on is_read for filtering unread notifications
*/

CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL CHECK (type IN ('location_alert', 'task_completed', 'leave_applied')),
  title text NOT NULL,
  message text NOT NULL,
  employee_id text NOT NULL,
  employee_name text NOT NULL,
  related_id text,
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  metadata jsonb
);

-- Enable RLS
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since Express handles auth)
CREATE POLICY "Allow all reads on notifications"
  ON notifications
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow all inserts on notifications"
  ON notifications
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Allow all updates on notifications"
  ON notifications
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow all deletes on notifications"
  ON notifications
  FOR DELETE
  TO public
  USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
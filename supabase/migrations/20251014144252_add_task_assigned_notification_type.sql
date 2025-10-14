/*
  # Add Task Assigned Notification Type

  1. Changes
    - Update notification type check constraint to include 'task_assigned'
    - Add 'leave_updated' type for when admin updates leave status
    
  This allows notifications to be sent when:
    - Admin assigns a task to an employee
    - Admin approves/rejects employee leave requests
*/

-- Drop the existing constraint
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS notifications_type_check;

-- Add new constraint with additional notification types
ALTER TABLE notifications ADD CONSTRAINT notifications_type_check 
  CHECK (type IN ('location_alert', 'task_completed', 'leave_applied', 'task_assigned', 'leave_updated'));

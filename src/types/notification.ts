export type NotificationType = 'location_alert' | 'task_completed' | 'leave_applied';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  employee_id: string;
  employee_name: string;
  related_id?: string;
  is_read: boolean;
  created_at: string;
  metadata?: Record<string, any>;
}

export interface CreateNotificationData {
  type: NotificationType;
  title: string;
  message: string;
  employee_id: string;
  employee_name: string;
  related_id?: string;
  metadata?: Record<string, any>;
}

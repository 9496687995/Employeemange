import { supabase } from '../lib/supabase';
import { Notification, CreateNotificationData } from '../types/notification';

export const notificationService = {
  async createNotification(data: CreateNotificationData): Promise<Notification> {
    const { data: notification, error } = await supabase
      .from('notifications')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return notification;
  },

  async getNotifications(limit = 50, userId?: string): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    // If userId is provided, filter notifications for that employee
    if (userId) {
      query = query.eq('employee_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getUnreadNotifications(userId?: string): Promise<Notification[]> {
    let query = supabase
      .from('notifications')
      .select('*')
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    if (userId) {
      query = query.eq('employee_id', userId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  },

  async getUnreadCount(userId?: string): Promise<number> {
    let query = supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('is_read', false);

    if (userId) {
      query = query.eq('employee_id', userId);
    }

    const { count, error } = await query;

    if (error) throw error;
    return count || 0;
  },

  async markAsRead(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  async markAllAsRead(): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('is_read', false);

    if (error) throw error;
  },

  async deleteNotification(notificationId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('id', notificationId);

    if (error) throw error;
  },

  subscribeToNotifications(callback: (notification: Notification) => void) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications'
        },
        (payload) => {
          callback(payload.new as Notification);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

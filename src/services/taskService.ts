import { supabase } from '../lib/supabase';
import { Task } from '../types/task';
import { notificationService } from './notificationService';

export const taskService = {
  async createTask(taskData: {
    title: string;
    description: string;
    assigned_to: string;
    assigned_to_name: string;
    created_by: string;
    priority: 'low' | 'medium' | 'high';
    due_date?: string;
  }) {
    const { data, error } = await supabase
      .from('tasks')
      .insert([taskData])
      .select()
      .single();

    if (error) throw error;

    // Create notification for the employee
    await notificationService.createNotification({
      type: 'task_assigned',
      title: 'New Task Assigned',
      message: `You have been assigned a new ${taskData.priority} priority task: ${taskData.title}`,
      employee_id: taskData.assigned_to,
      employee_name: taskData.assigned_to_name,
      related_id: data.id,
      metadata: {
        task_title: taskData.title,
        priority: taskData.priority,
        due_date: taskData.due_date
      }
    });

    return data;
  },

  async getTasksByEmployee(employeeId: string): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('assigned_to', employeeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAllTasks(): Promise<Task[]> {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async updateTaskStatus(taskId: string, status: 'pending' | 'completed') {
    const { data, error } = await supabase
      .from('tasks')
      .update({ status })
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateTask(taskId: string, updates: Partial<Task>) {
    const { data, error } = await supabase
      .from('tasks')
      .update(updates)
      .eq('id', taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(taskId: string) {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) throw error;
  },

  async getTaskStatistics(employeeId?: string) {
    let query = supabase.from('tasks').select('status');

    if (employeeId) {
      query = query.eq('assigned_to', employeeId);
    }

    const { data, error } = await query;

    if (error) throw error;

    const total = data?.length || 0;
    const completed = data?.filter(t => t.status === 'completed').length || 0;
    const pending = data?.filter(t => t.status === 'pending').length || 0;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return {
      total,
      completed,
      pending,
      percentage
    };
  }
};

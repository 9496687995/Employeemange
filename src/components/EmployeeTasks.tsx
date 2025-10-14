import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, AlertCircle, TrendingUp } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { taskService } from '../services/taskService';
import { Task } from '../types/task';

const EmployeeTasks: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    percentage: 0
  });

  useEffect(() => {
    if (user) {
      loadTasks();
    }
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const [tasksData, stats] = await Promise.all([
        taskService.getTasksByEmployee(user.id),
        taskService.getTaskStatistics(user.id)
      ]);
      setTasks(tasksData);
      setStatistics(stats);
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      await taskService.updateTaskStatus(task.id, newStatus);
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-orange-600 bg-orange-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '!!!';
      case 'medium': return '!!';
      case 'low': return '!';
      default: return '';
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
        <p className="text-gray-600 mt-1">Track and complete your assigned tasks</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Calendar className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-3 rounded-lg">
              <Clock className="text-red-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-gray-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-gray-900">{statistics.completed}</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-6">
          <div className="flex items-center gap-3">
            <div className="bg-white/20 p-3 rounded-lg">
              <TrendingUp className="text-white" size={24} />
            </div>
            <div>
              <p className="text-blue-100 text-sm">Completion Rate</p>
              <p className="text-3xl font-bold text-white">{statistics.percentage}%</p>
            </div>
          </div>
          <div className="mt-4">
            <div className="bg-white/20 rounded-full h-2 overflow-hidden">
              <div
                className="bg-white h-full rounded-full transition-all duration-500"
                style={{ width: `${statistics.percentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            Pending Tasks ({pendingTasks.length})
          </h3>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
                <Clock className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No pending tasks</p>
                <p className="text-gray-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-gradient-to-r from-red-50 to-white rounded-lg shadow-sm p-5 border-l-4 border-red-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{task.title}</h4>
                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="ml-3 p-2 hover:bg-green-100 rounded-lg transition-colors group"
                      title="Mark as completed"
                    >
                      <CheckCircle className="text-gray-400 group-hover:text-green-600 group-hover:scale-110 transition-all" size={24} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      PENDING
                    </span>
                    {task.due_date && (
                      <span className="text-gray-500 flex items-center gap-1">
                        <Calendar size={14} />
                        Due: {new Date(task.due_date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Completed Tasks ({completedTasks.length})
          </h3>
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-gray-200">
                <CheckCircle className="mx-auto text-gray-400 mb-3" size={48} />
                <p className="text-gray-500 font-medium">No completed tasks yet</p>
                <p className="text-gray-400 text-sm mt-1">Start completing your pending tasks</p>
              </div>
            ) : (
              completedTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-gradient-to-r from-green-50 to-white rounded-lg shadow-sm p-5 border-l-4 border-green-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold text-gray-900 text-lg">{task.title}</h4>
                        <span className={`inline-block px-2 py-1 text-xs font-bold rounded ${getPriorityColor(task.priority)}`}>
                          {getPriorityIcon(task.priority)} {task.priority.toUpperCase()}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-2">{task.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="ml-3 p-2 hover:bg-orange-100 rounded-lg transition-colors group"
                      title="Mark as pending"
                    >
                      <Clock className="text-gray-400 group-hover:text-orange-600 group-hover:scale-110 transition-all" size={24} />
                    </button>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                      <CheckCircle size={14} />
                      COMPLETED
                    </span>
                    {task.completed_at && (
                      <span className="text-gray-500 text-xs">
                        {new Date(task.completed_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {statistics.total > 0 && (
        <div className="bg-gradient-to-br from-blue-50 to-white rounded-lg shadow-sm p-6 border border-blue-200">
          <div className="flex items-start gap-4">
            <div className="bg-blue-100 p-3 rounded-lg">
              <AlertCircle className="text-blue-600" size={24} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 mb-2">Task Progress Summary</h3>
              <p className="text-gray-600 text-sm mb-4">
                You have completed <span className="font-bold text-green-600">{statistics.completed}</span> out of{' '}
                <span className="font-bold text-blue-600">{statistics.total}</span> tasks.
                {statistics.pending > 0 && (
                  <span className="text-red-600 font-medium">
                    {' '}There {statistics.pending === 1 ? 'is' : 'are'} still{' '}
                    <span className="font-bold">{statistics.pending}</span> pending{' '}
                    {statistics.pending === 1 ? 'task' : 'tasks'}.
                  </span>
                )}
              </p>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-600">Progress</span>
                    <span className="font-bold text-blue-600">{statistics.percentage}%</span>
                  </div>
                  <div className="bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${statistics.percentage}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EmployeeTasks;

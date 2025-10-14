import React, { useState, useEffect } from 'react';
import { CheckCircle, Clock, Calendar, User } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task } from '../lib/supabase';

const EmployeeTaskDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [user]);

  const loadTasks = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('assigned_to', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        setTasks(data);
      }
    } catch (error) {
      console.error('Error loading tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      loadTasks();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const pendingTasks = tasks.filter(t => t.status === 'pending');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-800">My Tasks</h1>
        <p className="text-slate-600 mt-1">Welcome back, {user?.full_name}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Clock className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Pending Tasks</p>
              <p className="text-2xl font-bold text-slate-800">{pendingTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <CheckCircle className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Completed Tasks</p>
              <p className="text-2xl font-bold text-slate-800">{completedTasks.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-3 rounded-lg">
              <Calendar className="text-orange-600" size={24} />
            </div>
            <div>
              <p className="text-slate-600 text-sm">Total Tasks</p>
              <p className="text-2xl font-bold text-slate-800">{tasks.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <Clock className="text-red-600" size={24} />
            Pending Tasks
          </h2>
          <div className="space-y-3">
            {pendingTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
                <Clock className="mx-auto text-slate-400 mb-3" size={48} />
                <p className="text-slate-500">No pending tasks</p>
                <p className="text-slate-400 text-sm mt-1">You're all caught up!</p>
              </div>
            ) : (
              pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-red-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg">{task.title}</h3>
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="text-green-600 hover:text-green-700 hover:scale-110 transition-all"
                      title="Mark as completed"
                    >
                      <CheckCircle size={24} />
                    </button>
                  </div>
                  {task.description && (
                    <p className="text-slate-600 text-sm mb-3">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-xs font-medium">
                      Pending
                    </span>
                    {task.due_date && (
                      <span className="text-slate-500 flex items-center gap-1">
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
          <h2 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <CheckCircle className="text-green-600" size={24} />
            Completed Tasks
          </h2>
          <div className="space-y-3">
            {completedTasks.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center border border-slate-200">
                <CheckCircle className="mx-auto text-slate-400 mb-3" size={48} />
                <p className="text-slate-500">No completed tasks yet</p>
                <p className="text-slate-400 text-sm mt-1">Start completing your pending tasks</p>
              </div>
            ) : (
              completedTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg">{task.title}</h3>
                    <button
                      onClick={() => toggleTaskStatus(task)}
                      className="text-orange-600 hover:text-orange-700 hover:scale-110 transition-all"
                      title="Mark as pending"
                    >
                      <Clock size={24} />
                    </button>
                  </div>
                  {task.description && (
                    <p className="text-slate-600 text-sm mb-3">{task.description}</p>
                  )}
                  <div className="flex justify-between items-center text-sm">
                    <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                      Completed
                    </span>
                    {task.due_date && (
                      <span className="text-slate-500 flex items-center gap-1">
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
      </div>
    </div>
  );
};

export default EmployeeTaskDashboard;

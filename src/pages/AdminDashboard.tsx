import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, CheckCircle, Clock, Calendar } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { supabase, Task, User } from '../lib/supabase';
import Modal from '../components/Modal';

interface TaskWithUser extends Task {
  assigned_user?: User;
}

const AdminDashboard: React.FC = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskWithUser[]>([]);
  const [employees, setEmployees] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assigned_to: '',
    due_date: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [tasksResponse, employeesResponse] = await Promise.all([
        supabase
          .from('tasks')
          .select('*, assigned_user:users!tasks_assigned_to_fkey(*)')
          .order('created_at', { ascending: false }),
        supabase
          .from('users')
          .select('*')
          .eq('role', 'employee')
          .order('full_name')
      ]);

      if (tasksResponse.data) {
        setTasks(tasksResponse.data as TaskWithUser[]);
      }

      if (employeesResponse.data) {
        setEmployees(employeesResponse.data);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingTask) {
        const { error } = await supabase
          .from('tasks')
          .update({
            title: formData.title,
            description: formData.description,
            assigned_to: formData.assigned_to,
            due_date: formData.due_date || null
          })
          .eq('id', editingTask.id);

        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('tasks')
          .insert([{
            title: formData.title,
            description: formData.description,
            assigned_to: formData.assigned_to,
            created_by: user?.id,
            due_date: formData.due_date || null,
            status: 'pending'
          }]);

        if (error) throw error;
      }

      setShowModal(false);
      setEditingTask(null);
      setFormData({ title: '', description: '', assigned_to: '', due_date: '' });
      loadData();
    } catch (error) {
      console.error('Error saving task:', error);
      alert('Failed to save task. Please try again.');
    }
  };

  const handleDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task. Please try again.');
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description,
      assigned_to: task.assigned_to,
      due_date: task.due_date || ''
    });
    setShowModal(true);
  };

  const toggleTaskStatus = async (task: Task) => {
    try {
      const newStatus = task.status === 'pending' ? 'completed' : 'pending';
      const { error } = await supabase
        .from('tasks')
        .update({ status: newStatus })
        .eq('id', task.id);

      if (error) throw error;
      loadData();
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status. Please try again.');
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setFormData({ title: '', description: '', assigned_to: '', due_date: '' });
    setShowModal(true);
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Team Leader Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage and assign tasks to your team</p>
        </div>
        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus size={20} />
          Create Task
        </button>
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
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-slate-500 border border-slate-200">
                No pending tasks
              </div>
            ) : (
              pendingTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-red-500 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg">{task.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="text-green-600 hover:text-green-700 transition-colors"
                        title="Mark as completed"
                      >
                        <CheckCircle size={20} />
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{task.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      <strong>Assigned to:</strong> {task.assigned_user?.full_name || 'Unassigned'}
                    </span>
                    {task.due_date && (
                      <span className="text-slate-500">
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
              <div className="bg-white rounded-lg shadow-sm p-6 text-center text-slate-500 border border-slate-200">
                No completed tasks
              </div>
            ) : (
              completedTasks.map(task => (
                <div
                  key={task.id}
                  className="bg-white rounded-lg shadow-sm p-5 border-l-4 border-green-500 hover:shadow-md transition-shadow"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-slate-800 text-lg">{task.title}</h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleTaskStatus(task)}
                        className="text-orange-600 hover:text-orange-700 transition-colors"
                        title="Mark as pending"
                      >
                        <Clock size={20} />
                      </button>
                      <button
                        onClick={() => handleEdit(task)}
                        className="text-blue-600 hover:text-blue-700 transition-colors"
                        title="Edit task"
                      >
                        <Edit2 size={20} />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                        title="Delete task"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  <p className="text-slate-600 text-sm mb-3">{task.description}</p>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-slate-700">
                      <strong>Assigned to:</strong> {task.assigned_user?.full_name || 'Unassigned'}
                    </span>
                    {task.due_date && (
                      <span className="text-slate-500">
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

      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingTask(null);
          setFormData({ title: '', description: '', assigned_to: '', due_date: '' });
        }}
        title={editingTask ? 'Edit Task' : 'Create New Task'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Task Title
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task title"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Assign To
            </label>
            <select
              required
              value={formData.assigned_to}
              onChange={(e) => setFormData({ ...formData, assigned_to: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select an employee</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.id}>
                  {emp.full_name} ({emp.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              Due Date
            </label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
            >
              {editingTask ? 'Update Task' : 'Create Task'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowModal(false);
                setEditingTask(null);
                setFormData({ title: '', description: '', assigned_to: '', due_date: '' });
              }}
              className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-2 px-4 rounded-lg transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminDashboard;

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Users } from 'lucide-react';
import { useEmployee, Department } from '../contexts/EmployeeContext';
import Modal from '../components/Modal';

const Departments = () => {
  const { departments, employees, addDepartment, updateDepartment, deleteDepartment } = useEmployee();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    manager: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingDepartment) {
      updateDepartment(editingDepartment.id, formData);
    } else {
      addDepartment(formData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      manager: ''
    });
    setEditingDepartment(null);
    setIsModalOpen(false);
  };

  const handleEdit = (department: Department) => {
    setEditingDepartment(department);
    setFormData({
      name: department.name,
      description: department.description,
      manager: department.manager
    });
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this department?')) {
      deleteDepartment(id);
    }
  };

  // Get actual employee count for each department
  const getDepartmentEmployeeCount = (departmentName: string) => {
    return employees.filter(emp => emp.department === departmentName).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-600">Manage your company's departments</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Department
        </button>
      </div>

      {/* Department Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {departments.map((department) => {
          const employeeCount = getDepartmentEmployeeCount(department.name);
          return (
            <div key={department.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">{department.name}</h3>
                  <p className="text-gray-600 text-sm mb-4">{department.description}</p>
                  
                  <div className="space-y-2">
                    <div className="flex items-center text-sm">
                      <span className="text-gray-500">Manager:</span>
                      <span className="ml-2 font-medium text-gray-900">{department.manager}</span>
                    </div>
                    <div className="flex items-center text-sm">
                      <Users className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-gray-500">Employees:</span>
                      <span className="ml-2 font-medium text-blue-600">{employeeCount}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(department)}
                    className="p-2 text-green-600 hover:text-green-900 hover:bg-green-50 rounded-lg transition-colors"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(department.id)}
                    className="p-2 text-red-600 hover:text-red-900 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Department Statistics */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Department Statistics</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map((department) => {
            const employeeCount = getDepartmentEmployeeCount(department.name);
            const avgSalary = employees
              .filter(emp => emp.department === department.name)
              .reduce((sum, emp, _, arr) => sum + emp.salary / arr.length, 0);

            return (
              <div key={`stats-${department.id}`} className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">{department.name}</h4>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Employees</span>
                    <span className="font-medium">{employeeCount}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Avg Salary</span>
                    <span className="font-medium">
                      {employeeCount > 0 ? `$${Math.round(avgSalary).toLocaleString()}` : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add/Edit Department Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingDepartment ? 'Edit Department' : 'Add New Department'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Department Name</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Engineering, Marketing"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Brief description of the department's role"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
            <select
              required
              value={formData.manager}
              onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select Manager</option>
              {employees.map(emp => (
                <option key={emp.id} value={emp.name}>{emp.name}</option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editingDepartment ? 'Update' : 'Add'} Department
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Departments;
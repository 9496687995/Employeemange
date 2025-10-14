import React, { useState } from 'react';
import { Plus, Search, CreditCard as Edit2, Trash2, Eye, Award, X } from 'lucide-react';
import { useEmployee, Employee } from '../contexts/EmployeeContext';
import Modal from '../components/Modal';

const Employees = () => {
  const { employees, departments, addEmployee, updateEmployee, deleteEmployee, addAchievement, deleteAchievement } = useEmployee();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [viewingEmployee, setViewingEmployee] = useState<Employee | null>(null);
  const [showAchievements, setShowAchievements] = useState(false);
  const [achievementEmployee, setAchievementEmployee] = useState<Employee | null>(null);
  const [isAddingAchievement, setIsAddingAchievement] = useState(false);
  const [photoPreview, setPhotoPreview] = useState<string>('');

  const [formData, setFormData] = useState<{
    name: string;
    email: string;
    profilePicture: string;
    position: string;
    department: string;
    salary: string;
    joinDate: string;
    dateOfBirth: string;
    phone: string;
    address: string;
    status: 'active' | 'inactive';
  }>({
    name: '',
    email: '',
    profilePicture: '',
    position: '',
    department: '',
    salary: '',
    joinDate: '',
    dateOfBirth: '',
    phone: '',
    address: '',
    status: 'active'
  });

  const [achievementFormData, setAchievementFormData] = useState({
    title: '',
    description: '',
    date: '',
    category: 'performance' as const
  });
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch = employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.position.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || employee.department === selectedDepartment;
    return matchesSearch && matchesDepartment;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const employeeData = {
      ...formData,
      salary: parseInt(formData.salary)
    };

    if (editingEmployee) {
      updateEmployee(editingEmployee.id, employeeData);
    } else {
      addEmployee(employeeData);
    }

    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      profilePicture: '',
      position: '',
      department: '',
      salary: '',
      joinDate: '',
      dateOfBirth: '',
      phone: '',
      address: '',
      status: 'active'
    });
    setEditingEmployee(null);
    setPhotoPreview('');
    setIsModalOpen(false);
  };

  const handleEdit = (employee: Employee) => {
    setEditingEmployee(employee);
    setFormData({
      name: employee.name,
      email: employee.email,
      profilePicture: employee.profilePicture || '',
      position: employee.position,
      department: employee.department,
      salary: employee.salary.toString(),
      joinDate: employee.joinDate,
      dateOfBirth: employee.dateOfBirth || '',
      phone: employee.phone,
      address: employee.address,
      status: employee.status
    });
    setPhotoPreview(employee.profilePicture || '');
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      deleteEmployee(id);
    }
  };

  const handleViewAchievements = (employee: Employee) => {
    setAchievementEmployee(employee);
    setShowAchievements(true);
  };

  const handleAddAchievement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!achievementEmployee) return;

    addAchievement(achievementEmployee.id, achievementFormData);
    setAchievementFormData({
      title: '',
      description: '',
      date: '',
      category: 'performance'
    });
    setIsAddingAchievement(false);

    // Update the achievement employee data
    const updatedEmployee = employees.find(emp => emp.id === achievementEmployee.id);
    if (updatedEmployee) {
      setAchievementEmployee(updatedEmployee);
    }
  };

  const handleDeleteAchievement = (achievementId: string) => {
    if (!achievementEmployee) return;
    if (window.confirm('Are you sure you want to delete this achievement?')) {
      deleteAchievement(achievementEmployee.id, achievementId);

      // Update the achievement employee data
      const updatedEmployee = employees.find(emp => emp.id === achievementEmployee.id);
      if (updatedEmployee) {
        setAchievementEmployee(updatedEmployee);
      }
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setPhotoPreview(result);
        setFormData({ ...formData, profilePicture: result });
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = () => {
    setPhotoPreview('');
    setFormData({ ...formData, profilePicture: '' });
  };

  const resetAchievementModal = () => {
    setShowAchievements(false);
    setAchievementEmployee(null);
    setIsAddingAchievement(false);
    setAchievementFormData({
      title: '',
      description: '',
      date: '',
      category: 'performance'
    });
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'performance': return 'bg-blue-100 text-blue-800';
      case 'leadership': return 'bg-purple-100 text-purple-800';
      case 'innovation': return 'bg-green-100 text-green-800';
      case 'teamwork': return 'bg-yellow-100 text-yellow-800';
      case 'certification': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-600">Manage your company's workforce</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Employee
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search employees..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
          <div className="sm:w-48">
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">All Departments</option>
              {departments.map(dept => (
                <option key={dept.id} value={dept.name}>{dept.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Employee Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Position
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Salary
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEmployees.map((employee) => (
                <tr key={employee.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {employee.profilePicture ? (
                        <img
                          src={employee.profilePicture}
                          alt={employee.name}
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                            if (e.currentTarget.nextElementSibling) {
                              (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ${employee.profilePicture ? 'hidden' : ''}`}>
                        <span className="text-blue-600 font-medium text-sm">
                          {employee.name.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{employee.name}</div>
                        <div className="text-sm text-gray-500">{employee.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.position}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {employee.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    ${employee.salary.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${employee.status === 'active'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                      }`}>
                      {employee.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setViewingEmployee(employee)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleEdit(employee)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleViewAchievements(employee)}
                        className="p-1 text-blue-600 hover:text-blue-900"
                        title="View Achievements"
                      >
                        <Award className="h-4 w-4" />
                      </button>
                      <div className="ml-4">
                        <button
                          onClick={() => handleDelete(employee.id)}
                          className="p-1 text-red-600 hover:text-red-900"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Employee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={resetForm}
        title={editingEmployee ? 'Edit Employee' : 'Add New Employee'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Photo Upload Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Profile Picture</label>
            <div className="flex items-center space-x-4">
              <div className="relative">
                {photoPreview ? (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                  />
                ) : (
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center border-2 border-gray-300">
                    <span className="text-gray-400 text-sm">No Photo</span>
                  </div>
                )}
                {photoPreview && (
                  <button
                    type="button"
                    onClick={removePhoto}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                )}
              </div>
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoUpload}
                  className="hidden"
                  id="photo-upload"
                />
                <label
                  htmlFor="photo-upload"
                  className="cursor-pointer inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
                >
                  Choose Photo
                </label>
                <p className="text-xs text-gray-500 mt-1">Max 5MB, JPG/PNG only</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
              <input
                type="text"
                required
                value={formData.position}
                onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
              <select
                required
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Select Department</option>
                {departments.map(dept => (
                  <option key={dept.id} value={dept.name}>{dept.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary</label>
              <input
                type="number"
                required
                value={formData.salary}
                onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Join Date</label>
              <input
                type="date"
                required
                value={formData.joinDate}
                onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
            <input
              type="date"
              required
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              required
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
              {editingEmployee ? 'Update' : 'Add'} Employee
            </button>
          </div>
        </form>
      </Modal>

      {/* View Employee Modal */}
      <Modal
        isOpen={!!viewingEmployee}
        onClose={() => setViewingEmployee(null)}
        title="Employee Details"
      >
        {viewingEmployee && (
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              {viewingEmployee.profilePicture ? (
                <img
                  src={viewingEmployee.profilePicture}
                  alt={viewingEmployee.name}
                  className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                    if (e.currentTarget.nextElementSibling) {
                      (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                    }
                  }}
                />
              ) : null}
              <div className={`w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center border-2 border-gray-200 ${viewingEmployee.profilePicture ? 'hidden' : ''}`}>
                <span className="text-blue-600 font-bold text-xl">
                  {viewingEmployee.name.split(' ').map(n => n[0]).join('')}
                </span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{viewingEmployee.name}</h3>
                <p className="text-gray-600">{viewingEmployee.position}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-sm text-gray-900">{viewingEmployee.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Department</p>
                <p className="text-sm text-gray-900">{viewingEmployee.department}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Salary</p>
                <p className="text-sm text-gray-900">${viewingEmployee.salary.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Join Date</p>
                <p className="text-sm text-gray-900">{new Date(viewingEmployee.joinDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Phone</p>
                <p className="text-sm text-gray-900">{viewingEmployee.phone}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${viewingEmployee.status === 'active'
                    ? 'bg-green-100 text-green-800'
                    : 'bg-red-100 text-red-800'
                  }`}>
                  {viewingEmployee.status}
                </span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-sm font-medium text-gray-500">Address</p>
              <p className="text-sm text-gray-900">{viewingEmployee.address}</p>
            </div>

            {viewingEmployee.achievements && viewingEmployee.achievements.length > 0 && (
              <div className="pt-4 border-t border-gray-200">
                <p className="text-sm font-medium text-gray-500 mb-2">Recent Achievements</p>
                <div className="space-y-2">
                  {viewingEmployee.achievements.slice(0, 2).map((achievement) => (
                    <div key={achievement.id} className="flex items-center space-x-2">
                      <Award className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm text-gray-900">{achievement.title}</span>
                      <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(achievement.category)}`}>
                        {achievement.category}
                      </span>
                    </div>
                  ))}
                  {viewingEmployee.achievements.length > 2 && (
                    <p className="text-xs text-gray-500">
                      +{viewingEmployee.achievements.length - 2} more achievements
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Achievements Modal */}
      <Modal
        isOpen={showAchievements}
        onClose={resetAchievementModal}
        title={`${achievementEmployee?.name} - Achievements`}
      >
        {achievementEmployee && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {achievementEmployee.profilePicture ? (
                  <img
                    src={achievementEmployee.profilePicture}
                    alt={achievementEmployee.name}
                    className="w-10 h-10 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.nextElementSibling) {
                        (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                      }
                    }}
                  />
                ) : null}
                <div className={`w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center ${achievementEmployee.profilePicture ? 'hidden' : ''}`}>
                  <span className="text-blue-600 font-medium text-sm">
                    {achievementEmployee.name.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{achievementEmployee.name}</h3>
                  <p className="text-sm text-gray-500">{achievementEmployee.position}</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddingAchievement(true)}
                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Achievement
              </button>
            </div>

            {/* Add Achievement Form */}
            {isAddingAchievement && (
              <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <form onSubmit={handleAddAchievement} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                    <input
                      type="text"
                      required
                      value={achievementFormData.title}
                      onChange={(e) => setAchievementFormData({ ...achievementFormData, title: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      placeholder="e.g., Employee of the Month"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      required
                      value={achievementFormData.description}
                      onChange={(e) => setAchievementFormData({ ...achievementFormData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      rows={2}
                      placeholder="Brief description of the achievement"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date"
                        required
                        value={achievementFormData.date}
                        onChange={(e) => setAchievementFormData({ ...achievementFormData, date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        value={achievementFormData.category}
                        onChange={(e) => setAchievementFormData({ ...achievementFormData, category: e.target.value as any })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                      >
                        <option value="performance">Performance</option>
                        <option value="leadership">Leadership</option>
                        <option value="innovation">Innovation</option>
                        <option value="teamwork">Teamwork</option>
                        <option value="certification">Certification</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end space-x-2">
                    <button
                      type="button"
                      onClick={() => setIsAddingAchievement(false)}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 text-sm text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                    >
                      Add Achievement
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Achievements List */}
            <div className="space-y-3">
              {achievementEmployee.achievements && achievementEmployee.achievements.length > 0 ? (
                achievementEmployee.achievements
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((achievement) => (
                    <div key={achievement.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <Award className="h-5 w-5 text-yellow-500" />
                            <h4 className="font-medium text-gray-900">{achievement.title}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${getCategoryColor(achievement.category)}`}>
                              {achievement.category}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{achievement.description}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(achievement.date).toLocaleDateString()}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAchievement(achievement.id)}
                          className="p-1 text-red-600 hover:text-red-900 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))
              ) : (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No achievements yet</p>
                  <p className="text-sm text-gray-400">Click "Add Achievement" to get started</p>
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Employees;
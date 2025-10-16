import { Users, Building2, DollarSign, Calendar, TrendingUp, ArrowUpRight, ArrowDownRight, MoreVertical, Plus } from 'lucide-react';
import { useEmployee } from '../contexts/EmployeeContext';
import LeaveAnalytics from '../components/LeaveAnalytics';
import TaskManagement from '../components/TaskManagement';

const Dashboard = () => {
  const { employees, departments, leaves } = useEmployee();

  const totalSalary = employees.reduce((sum, emp) => sum + emp.salary, 0);
  const monthlyPay = totalSalary;

  const leaveStats = {
    applied: leaves.length,
    approved: leaves.filter(l => l.status === 'approved').length,
    pending: leaves.filter(l => l.status === 'pending').length,
    rejected: leaves.filter(l => l.status === 'rejected').length
  };

  const recentEmployees = employees.slice(-5);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-500 mt-1">Welcome back! Here's your overview</p>
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg transition-colors font-medium">
            <Plus size={20} />
            New Task
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Total Employees</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{employees.length}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} />
                2.5%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-purple-600" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Departments</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{departments.length}</p>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} />
                1.2%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Monthly Payroll</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">${(monthlyPay / 1000).toFixed(0)}K</p>
              <div className="flex items-center gap-1 text-green-600 text-sm font-medium">
                <ArrowUpRight size={16} />
                3.1%
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-orange-50 rounded-lg flex items-center justify-center">
                <Calendar className="w-6 h-6 text-orange-600" />
              </div>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">Pending Leaves</h3>
            <div className="flex items-end justify-between">
              <p className="text-3xl font-bold text-gray-900">{leaveStats.pending}</p>
              <div className="flex items-center gap-1 text-red-600 text-sm font-medium">
                <ArrowDownRight size={16} />
                0.5%
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Recent Employees */}
          <div className="lg:col-span-2 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Recent Employees</h2>
              <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
            </div>
            <div className="space-y-4">
              {recentEmployees.map((emp) => (
                <div key={emp.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-semibold text-sm">
                        {emp.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{emp.name}</h3>
                      <p className="text-sm text-gray-500">{emp.position}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{emp.department}</p>
                    <p className="text-sm text-gray-500">${emp.salary.toLocaleString()}/mo</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Leave Summary */}
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-gray-900">Leave Summary</h2>
              <button className="text-gray-400 hover:text-gray-600">
                <MoreVertical size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Approved</span>
                  <span className="text-2xl font-bold text-gray-900">{leaveStats.approved}</span>
                </div>
                <div className="w-full bg-green-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: `${(leaveStats.approved / leaveStats.applied) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Pending</span>
                  <span className="text-2xl font-bold text-gray-900">{leaveStats.pending}</span>
                </div>
                <div className="w-full bg-yellow-200 rounded-full h-2">
                  <div className="bg-yellow-600 h-2 rounded-full" style={{ width: `${(leaveStats.pending / leaveStats.applied) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg border border-red-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Rejected</span>
                  <span className="text-2xl font-bold text-gray-900">{leaveStats.rejected}</span>
                </div>
                <div className="w-full bg-red-200 rounded-full h-2">
                  <div className="bg-red-600 h-2 rounded-full" style={{ width: `${(leaveStats.rejected / leaveStats.applied) * 100}%` }}></div>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Total Requests</span>
                  <span className="text-2xl font-bold text-gray-900">{leaveStats.applied}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Departments */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Departments Overview</h2>
            <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">View All</button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {departments.map((dept, index) => {
              const colors = [
                { bg: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' },
                { bg: 'bg-purple-50', text: 'text-purple-600', border: 'border-purple-100' },
                { bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' },
                { bg: 'bg-orange-50', text: 'text-orange-600', border: 'border-orange-100' }
              ];
              const color = colors[index % colors.length];

              return (
                <div key={dept.id} className={`${color.bg} ${color.border} border rounded-lg p-4 hover:shadow-md transition-shadow`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 ${color.bg} rounded-lg flex items-center justify-center`}>
                      <Building2 className={`w-5 h-5 ${color.text}`} />
                    </div>
                    <span className={`text-xl font-bold ${color.text}`}>{dept.employeeCount}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-1">{dept.name}</h3>
                  <p className="text-sm text-gray-600">{dept.manager}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>Utilization</span>
                      <span className="font-medium">75%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Management */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <TaskManagement />
        </div>

        {/* Leave Analytics */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Leave Analytics</h2>
                <p className="text-sm text-gray-500">Track employee leave patterns</p>
              </div>
            </div>
          </div>
          <LeaveAnalytics />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

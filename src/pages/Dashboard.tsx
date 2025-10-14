import { Users, Building2, DollarSign, Calendar, Check, Clock, X, TrendingUp, Filter } from 'lucide-react';
import { useEmployee } from '../contexts/EmployeeContext';
import LeaveAnalytics from '../components/LeaveAnalytics';

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

  const statsCards = [
    { title: 'Total Employees', value: employees.length, icon: Users, color: 'from-blue-400 to-cyan-300', change: '+2.5%' },
    { title: 'Total Departments', value: departments.length, icon: Building2, color: 'from-indigo-400 to-blue-300', change: '+1.2%' },
    { title: 'Monthly Pay', value: `$${monthlyPay.toLocaleString()}`, icon: DollarSign, color: 'from-cyan-400 to-blue-300', change: '+3.1%' }
  ];

  const leaveCards = [
    { title: 'Leave Applied', value: leaveStats.applied, icon: Calendar, color: 'from-blue-400 to-cyan-300' },
    { title: 'Approved', value: leaveStats.approved, icon: Check, color: 'from-green-400 to-emerald-300' },
    { title: 'Pending', value: leaveStats.pending, icon: Clock, color: 'from-yellow-300 to-amber-200' },
    { title: 'Rejected', value: leaveStats.rejected, icon: X, color: 'from-red-400 to-pink-300' }
  ];

  const recentEmployees = employees.slice(-3);

  return (
    <div className="relative min-h-screen bg-white p-8 text-gray-900 overflow-x-hidden">
      {/* Glassmorphism Overlay */}
      <div className="absolute inset-0 backdrop-blur-xl bg-white/30 pointer-events-none -z-10"></div>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold drop-shadow-sm">Dashboard</h1>
        <p className="text-gray-700 text-sm mt-2">Welcome back! Here’s an overview of your company’s performance.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {statsCards.map(card => (
          <div
            key={card.title}
            className={`relative p-6 rounded-2xl shadow-lg bg-gradient-to-r ${card.color} text-white 
              hover:scale-[1.03] transition-transform duration-300`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90">{card.title}</p>
                <p className="text-3xl font-bold mt-2">{card.value}</p>
              </div>
              <div className="p-3 rounded-full bg-white/30 backdrop-blur-md">
                <card.icon className="h-6 w-6 text-white" />
              </div>
            </div>
            <span className="absolute bottom-4 right-6 text-sm opacity-80">{card.change} from last month</span>
          </div>
        ))}
      </div>

      {/* Leave Details + Recent Employees */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-10">
        {/* Leave Details */}
        <div className="rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg border border-gray-200 p-6 hover:bg-white/70 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Leave Details</h2>
            <Calendar className="h-5 w-5 text-gray-700" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            {leaveCards.map(card => (
              <div
                key={card.title}
                className={`flex items-center p-4 rounded-xl shadow-md bg-gradient-to-r ${card.color} text-white hover:scale-[1.02] transition-transform`}
              >
                <div className="p-2 rounded-full bg-white/30 mr-3">
                  <card.icon className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm opacity-90">{card.title}</p>
                  <p className="text-xl font-bold">{card.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Employees */}
        <div className="rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg border border-gray-200 p-6 hover:bg-white/70 transition-all">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold text-gray-900">Recent Employees</h2>
            <Users className="h-5 w-5 text-gray-700" />
          </div>
          <div className="space-y-4">
            {recentEmployees.map(emp => (
              <div
                key={emp.id}
                className="flex items-center justify-between p-4 rounded-xl bg-white/40 hover:bg-white/60 backdrop-blur-md transition-all shadow-sm"
              >
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 flex items-center justify-center rounded-full bg-gradient-to-br from-blue-400 to-cyan-300 font-semibold text-white">
                    {emp.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{emp.name}</p>
                    <p className="text-sm text-gray-600">{emp.position}</p>
                  </div>
                </div>
                <div className="text-right text-sm text-gray-700">
                  <p>{emp.department}</p>
                  <p className="text-indigo-500">Joined {new Date(emp.joinDate).toLocaleDateString()}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Leave Analytics */}
      <div className="rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg border border-gray-200 p-6 mt-10 hover:bg-white/70 transition-all">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <TrendingUp className="h-6 w-6 text-gray-700 mr-3" />
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Leave Analytics</h2>
              <p className="text-sm text-gray-600">Track individual employee leave patterns</p>
            </div>
          </div>
          <Filter className="h-5 w-5 text-gray-500" />
        </div>
        <LeaveAnalytics />
      </div>

      {/* Department Overview */}
      <div className="rounded-2xl bg-white/50 backdrop-blur-lg shadow-lg border border-gray-200 p-6 mt-10 hover:bg-white/70 transition-all">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Department Overview</h2>
          <Building2 className="h-5 w-5 text-gray-700" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {departments.map(dept => (
            <div
              key={dept.id}
              className="p-4 border border-gray-200 rounded-xl bg-white/40 backdrop-blur-md hover:bg-white/60 transition-all shadow-sm"
            >
              <h3 className="font-medium text-gray-900">{dept.name}</h3>
              <p className="text-sm text-gray-600 mt-1">{dept.description}</p>
              <div className="mt-3 flex items-center justify-between text-sm text-gray-700">
                <span>Manager: {dept.manager}</span>
                <span className="font-medium text-indigo-500">{dept.employeeCount} employees</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

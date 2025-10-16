import { Users, Building2, DollarSign, Calendar, TrendingUp, ArrowUp, ArrowDown, Activity } from 'lucide-react';
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

  const recentEmployees = employees.slice(-6);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="max-w-screen-2xl mx-auto space-y-4">

        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-white font-mono uppercase tracking-wide">TASK MANAGEMENT SYSTEM</h1>
          <p className="text-slate-400 text-sm font-mono mt-1">Real-time task tracking and assignment</p>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 hover:border-cyan-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-cyan-400" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Employees</span>
              </div>
              <ArrowUp className="h-3 w-3 text-green-400" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white tabular-nums">{employees.length}</div>
              <div className="text-xs text-green-400 font-mono">+2.5%</div>
            </div>
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-500" style={{ width: '75%' }}></div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 hover:border-blue-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-400" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Departments</span>
              </div>
              <ArrowUp className="h-3 w-3 text-green-400" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white tabular-nums">{departments.length}</div>
              <div className="text-xs text-green-400 font-mono">+1.2%</div>
            </div>
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" style={{ width: '60%' }}></div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 hover:border-green-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-400" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Payroll</span>
              </div>
              <ArrowUp className="h-3 w-3 text-green-400" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white tabular-nums">${(monthlyPay / 1000).toFixed(1)}K</div>
              <div className="text-xs text-green-400 font-mono">+3.1%</div>
            </div>
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-emerald-500" style={{ width: '85%' }}></div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg p-4 hover:border-yellow-500/50 transition-all">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-yellow-400" />
                <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">Pending Leaves</span>
              </div>
              <Activity className="h-3 w-3 text-yellow-400" />
            </div>
            <div className="flex items-end justify-between">
              <div className="text-3xl font-bold text-white tabular-nums">{leaveStats.pending}</div>
              <div className="text-xs text-slate-400 font-mono">Awaiting</div>
            </div>
            <div className="mt-3 h-1 bg-slate-800 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-500 to-orange-500" style={{ width: '45%' }}></div>
            </div>
          </div>
        </div>

        {/* Task Management */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-mono uppercase tracking-wide text-slate-300 font-semibold">Task Management System</h2>
          </div>
          <div className="p-6">
            <TaskManagement />
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Employee Data Table */}
          <div className="lg:col-span-2 bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-mono uppercase tracking-wide text-slate-300 font-semibold">Employee Data Stream</h2>
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-xs text-slate-400 font-mono">STREAMING</span>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-800/30">
                  <tr className="border-b border-slate-700/50">
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Name</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Position</th>
                    <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Department</th>
                    <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Salary</th>
                    <th className="text-center px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  {recentEmployees.map((emp) => (
                    <tr key={emp.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            {emp.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <span className="font-medium text-white">{emp.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{emp.position}</td>
                      <td className="px-4 py-3 text-slate-300">{emp.department}</td>
                      <td className="px-4 py-3 text-right font-mono text-green-400">${emp.salary.toLocaleString()}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <span className="px-2 py-1 text-xs font-mono bg-green-500/20 text-green-400 rounded border border-green-500/30">
                            ACTIVE
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Leave Status Panel */}
          <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
            <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
              <h2 className="text-sm font-mono uppercase tracking-wide text-slate-300 font-semibold">Leave Status</h2>
            </div>
            <div className="p-4 space-y-3">
              <div className="bg-slate-800/50 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-green-400" />
                    <span className="text-xs text-slate-400 font-mono uppercase">Approved</span>
                  </div>
                  <ArrowUp className="h-3 w-3 text-green-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{leaveStats.approved}</div>
                <div className="mt-2 text-xs text-green-400 font-mono">+{Math.round((leaveStats.approved / leaveStats.applied) * 100)}%</div>
              </div>

              <div className="bg-slate-800/50 border border-yellow-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Activity className="h-4 w-4 text-yellow-400" />
                    <span className="text-xs text-slate-400 font-mono uppercase">Pending</span>
                  </div>
                  <Activity className="h-3 w-3 text-yellow-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{leaveStats.pending}</div>
                <div className="mt-2 text-xs text-slate-400 font-mono">Awaiting review</div>
              </div>

              <div className="bg-slate-800/50 border border-red-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <ArrowDown className="h-4 w-4 text-red-400" />
                    <span className="text-xs text-slate-400 font-mono uppercase">Rejected</span>
                  </div>
                  <ArrowDown className="h-3 w-3 text-red-400" />
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{leaveStats.rejected}</div>
                <div className="mt-2 text-xs text-red-400 font-mono">-{Math.round((leaveStats.rejected / leaveStats.applied) * 100)}%</div>
              </div>

              <div className="bg-slate-800/50 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-xs text-slate-400 font-mono uppercase">Total</span>
                  </div>
                </div>
                <div className="text-2xl font-bold text-white tabular-nums">{leaveStats.applied}</div>
                <div className="mt-2 text-xs text-slate-400 font-mono">All requests</div>
              </div>
            </div>
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
            <h2 className="text-sm font-mono uppercase tracking-wide text-slate-300 font-semibold">Department Overview</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-800/30">
                <tr className="border-b border-slate-700/50">
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Department</th>
                  <th className="text-left px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Manager</th>
                  <th className="text-center px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Employees</th>
                  <th className="text-right px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Utilization</th>
                  <th className="text-center px-4 py-3 text-xs font-mono uppercase tracking-wider text-slate-400">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50">
                {departments.map((dept) => {
                  const utilization = Math.floor(Math.random() * 30) + 70;
                  return (
                    <tr key={dept.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4 text-blue-400" />
                          <span className="font-medium text-white">{dept.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-300">{dept.manager}</td>
                      <td className="px-4 py-3 text-center">
                        <span className="px-2 py-1 text-xs font-mono bg-cyan-500/20 text-cyan-400 rounded">
                          {dept.employeeCount}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${utilization > 85 ? 'bg-green-500' : 'bg-yellow-500'}`}
                              style={{ width: `${utilization}%` }}
                            ></div>
                          </div>
                          <span className="text-xs font-mono text-slate-400 w-10 text-right">{utilization}%</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <span className={`px-2 py-1 text-xs font-mono rounded border ${
                            utilization > 85
                              ? 'bg-green-500/20 text-green-400 border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                          }`}>
                            {utilization > 85 ? 'OPTIMAL' : 'MODERATE'}
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Leave Analytics */}
        <div className="bg-slate-900/80 border border-slate-700/50 rounded-lg overflow-hidden">
          <div className="bg-slate-800/50 px-4 py-3 border-b border-slate-700/50">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-cyan-400" />
              <h2 className="text-sm font-mono uppercase tracking-wide text-slate-300 font-semibold">Leave Analytics</h2>
            </div>
          </div>
          <div className="p-6">
            <LeaveAnalytics />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

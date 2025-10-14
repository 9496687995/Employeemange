import { useState, useMemo } from 'react';
import { Calendar, User, TrendingUp, BarChart3, Download, Clock, Check, X } from 'lucide-react';
import { useEmployee } from '../contexts/EmployeeContext';

interface LeaveAnalyticsData {
  employeeId: string;
  employeeName: string;
  totalLeaves: number;
  approvedLeaves: number;
  pendingLeaves: number;
  rejectedLeaves: number;
  totalDays: number;
  approvedDays: number;
  leavesByType: {
    sick: number;
    vacation: number;
    personal: number;
    emergency: number;
  };
  monthlyBreakdown: {
    [key: string]: {
      count: number;
      days: number;
    };
  };
}

const LeaveAnalytics = () => {
  const { employees, leaves } = useEmployee();
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedPeriod, setSelectedPeriod] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);

  // Generate analytics data
  const analyticsData = useMemo(() => {
    const data: LeaveAnalyticsData[] = employees.map(employee => {
      const employeeLeaves = leaves.filter(leave => leave.employeeId === employee.id);

      // Filter by period
      const filteredLeaves = employeeLeaves.filter(leave => {
        const leaveDate = new Date(leave.startDate);
        const leaveYear = leaveDate.getFullYear();
        const leaveMonth = leaveDate.getMonth() + 1;

        if (selectedPeriod === 'yearly') {
          return leaveYear === selectedYear;
        } else {
          return leaveYear === selectedYear && leaveMonth === selectedMonth;
        }
      });

      const approvedLeaves = filteredLeaves.filter(l => l.status === 'approved');
      const pendingLeaves = filteredLeaves.filter(l => l.status === 'pending');
      const rejectedLeaves = filteredLeaves.filter(l => l.status === 'rejected');

      const totalDays = filteredLeaves.reduce((sum, leave) => sum + leave.days, 0);
      const approvedDays = approvedLeaves.reduce((sum, leave) => sum + leave.days, 0);

      // Leave types breakdown
      const leavesByType = {
        sick: filteredLeaves.filter(l => l.type === 'sick').length,
        vacation: filteredLeaves.filter(l => l.type === 'vacation').length,
        personal: filteredLeaves.filter(l => l.type === 'personal').length,
        emergency: filteredLeaves.filter(l => l.type === 'emergency').length,
      };

      // Monthly breakdown for yearly view
      const monthlyBreakdown: { [key: string]: { count: number; days: number } } = {};
      if (selectedPeriod === 'yearly') {
        for (let month = 1; month <= 12; month++) {
          const monthLeaves = employeeLeaves.filter(leave => {
            const leaveDate = new Date(leave.startDate);
            return leaveDate.getFullYear() === selectedYear && leaveDate.getMonth() + 1 === month;
          });

          monthlyBreakdown[month.toString()] = {
            count: monthLeaves.length,
            days: monthLeaves.reduce((sum, leave) => sum + leave.days, 0)
          };
        }
      }

      return {
        employeeId: employee.id,
        employeeName: employee.name,
        totalLeaves: filteredLeaves.length,
        approvedLeaves: approvedLeaves.length,
        pendingLeaves: pendingLeaves.length,
        rejectedLeaves: rejectedLeaves.length,
        totalDays,
        approvedDays,
        leavesByType,
        monthlyBreakdown
      };
    });

    // Filter by selected employee if specified
    if (selectedEmployee) {
      return data.filter(d => d.employeeId === selectedEmployee);
    }

    return data.sort((a, b) => b.totalDays - a.totalDays);
  }, [employees, leaves, selectedEmployee, selectedPeriod, selectedYear, selectedMonth]);

  // Calculate summary statistics
  const summaryStats = useMemo(() => {
    const totalEmployees = analyticsData.length;
    const totalLeaveRequests = analyticsData.reduce((sum, emp) => sum + emp.totalLeaves, 0);
    const totalLeaveDays = analyticsData.reduce((sum, emp) => sum + emp.totalDays, 0);
    const avgLeaveDays = totalEmployees > 0 ? totalLeaveDays / totalEmployees : 0;

    return {
      totalEmployees,
      totalLeaveRequests,
      totalLeaveDays,
      avgLeaveDays
    };
  }, [analyticsData]);

  const exportAnalytics = () => {
    const csvContent = [
      ['Employee Name', 'Total Requests', 'Approved', 'Pending', 'Rejected', 'Total Days', 'Approved Days', 'Sick', 'Vacation', 'Personal', 'Emergency'],
      ...analyticsData.map(emp => [
        emp.employeeName,
        emp.totalLeaves.toString(),
        emp.approvedLeaves.toString(),
        emp.pendingLeaves.toString(),
        emp.rejectedLeaves.toString(),
        emp.totalDays.toString(),
        emp.approvedDays.toString(),
        emp.leavesByType.sick.toString(),
        emp.leavesByType.vacation.toString(),
        emp.leavesByType.personal.toString(),
        emp.leavesByType.emergency.toString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    const periodText = selectedPeriod === 'yearly' ? selectedYear : `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}`;
    a.download = `leave-analytics-${periodText}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getMonthName = (month: number) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months[month - 1];
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Employee</label>
          <select
            value={selectedEmployee}
            onChange={(e) => setSelectedEmployee(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="">All Employees</option>
            {employees.map(emp => (
              <option key={emp.id} value={emp.id}>{emp.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as 'monthly' | 'yearly')}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            <option value="monthly">Monthly</option>
            <option value="yearly">Yearly</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          >
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        {selectedPeriod === 'monthly' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
            >
              {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                <option key={month} value={month}>{getMonthName(month)}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="flex items-center">
            <User className="h-5 w-5 text-blue-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-blue-700">Employees</p>
              <p className="text-xl font-bold text-blue-900">{summaryStats.totalEmployees}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="flex items-center">
            <Calendar className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-green-700">Total Requests</p>
              <p className="text-xl font-bold text-green-900">{summaryStats.totalLeaveRequests}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="flex items-center">
            <Clock className="h-5 w-5 text-purple-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-purple-700">Total Days</p>
              <p className="text-xl font-bold text-purple-900">{summaryStats.totalLeaveDays}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
          <div className="flex items-center">
            <TrendingUp className="h-5 w-5 text-orange-600 mr-2" />
            <div>
              <p className="text-sm font-medium text-orange-700">Avg Days/Employee</p>
              <p className="text-xl font-bold text-orange-900">{summaryStats.avgLeaveDays.toFixed(1)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Export Button */}
      <div className="flex justify-end">
        <button
          onClick={exportAnalytics}
          className="inline-flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4 mr-2" />
          Export Analytics
        </button>
      </div>

      {/* Analytics Table */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Employee
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Requests
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status Breakdown
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Days
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Leave Types
                </th>
                {selectedPeriod === 'yearly' && (
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monthly Trend
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {analyticsData.map((emp) => (
                <tr key={emp.employeeId} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium text-xs">
                          {emp.employeeName.split(' ').map(n => n[0]).join('')}
                        </span>
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{emp.employeeName}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{emp.totalLeaves}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex space-x-2">
                      <div className="flex items-center">
                        <Check className="h-3 w-3 text-green-600 mr-1" />
                        <span className="text-xs text-green-600">{emp.approvedLeaves}</span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 text-yellow-600 mr-1" />
                        <span className="text-xs text-yellow-600">{emp.pendingLeaves}</span>
                      </div>
                      <div className="flex items-center">
                        <X className="h-3 w-3 text-red-600 mr-1" />
                        <span className="text-xs text-red-600">{emp.rejectedLeaves}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{emp.totalDays}</div>
                    <div className="text-xs text-gray-500">({emp.approvedDays} approved)</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="grid grid-cols-2 gap-1 text-xs">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Sick:</span>
                        <span className="font-medium">{emp.leavesByType.sick}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Vacation:</span>
                        <span className="font-medium">{emp.leavesByType.vacation}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Personal:</span>
                        <span className="font-medium">{emp.leavesByType.personal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Emergency:</span>
                        <span className="font-medium">{emp.leavesByType.emergency}</span>
                      </div>
                    </div>
                  </td>
                  {selectedPeriod === 'yearly' && (
                    <td className="px-6 py-4">
                      <div className="flex space-x-1">
                        {Object.entries(emp.monthlyBreakdown).map(([month, data]) => (
                          <div
                            key={month}
                            className={`w-6 h-6 rounded text-xs flex items-center justify-center ${data.count > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-400'
                              }`}
                            title={`${getMonthName(parseInt(month))}: ${data.count} requests, ${data.days} days`}
                          >
                            {data.count}
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Employee Detail View */}
      {selectedEmployee && analyticsData.length === 1 && selectedPeriod === 'yearly' && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Breakdown for {analyticsData[0].employeeName}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Object.entries(analyticsData[0].monthlyBreakdown).map(([month, data]) => (
              <div key={month} className="p-4 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{getMonthName(parseInt(month))}</h4>
                  <BarChart3 className="h-4 w-4 text-gray-400" />
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Requests:</span>
                    <span className="font-medium">{data.count}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Days:</span>
                    <span className="font-medium">{data.days}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default LeaveAnalytics;
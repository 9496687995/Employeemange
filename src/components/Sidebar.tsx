import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  Calendar,
  DollarSign,
  Clock,
  MapPin,
  Settings,
  LogOut,
  Activity
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Sidebar = () => {
  const { logout, user } = useAuth();

  const adminNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/employees', icon: Users, label: 'Employees' },
    { path: '/departments', icon: Building2, label: 'Departments' },
    { path: '/attendance', icon: Clock, label: 'Attendance' },
    { path: '/location-attendance', icon: MapPin, label: 'Location Tracking' },
    { path: '/leave', icon: Calendar, label: 'Leave' },
    { path: '/salary', icon: DollarSign, label: 'Salary' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const employeeNavItems = [
    { path: '/employee-dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/leave', icon: Calendar, label: 'My Leave' },
    { path: '/salary', icon: DollarSign, label: 'My Salary' },
    { path: '/settings', icon: Settings, label: 'Settings' }
  ];

  const navItems = user?.role === 'admin' ? adminNavItems : employeeNavItems;
  const sidebarWidth = user?.role === 'employee' ? 'w-56' : 'w-64';

  return (
    <div
      className={`fixed left-0 top-0 h-full ${sidebarWidth}
      bg-slate-900 border-r border-slate-700/50 shadow-2xl`}
    >
      {/* Brand Header */}
      <div className="flex items-center px-6 py-5 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white block leading-tight">EMS TERMINAL</span>
            <span className="text-xs text-cyan-400 font-mono">v2.5.1</span>
          </div>
        </div>
      </div>

      {/* Live Status Indicator */}
      <div className="px-6 py-3 bg-slate-800/30 border-b border-slate-700/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400 font-mono uppercase tracking-wide">System Online</span>
          </div>
          <span className="text-xs text-cyan-400 font-mono">LIVE</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-4 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-1 text-sm font-medium transition-all duration-200 relative group
              ${isActive
                ? 'bg-slate-800 text-cyan-400 border-l-4 border-cyan-400'
                : 'text-slate-400 hover:bg-slate-800/50 hover:text-cyan-300 border-l-4 border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 mr-3 ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-cyan-400'
                    }`}
                />
                <span className="font-mono text-xs uppercase tracking-wider">{item.label}</span>
                {isActive && (
                  <div className="absolute right-3 w-1.5 h-1.5 bg-cyan-400 rounded-full"></div>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* System Stats */}
      <div className="absolute bottom-20 left-3 right-3 p-4 bg-slate-800/50 border border-slate-700/50 rounded-lg">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">CPU</span>
            <span className="text-xs text-green-400 font-mono">24%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1">
            <div className="bg-green-400 h-1 rounded-full" style={{ width: '24%' }}></div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">MEMORY</span>
            <span className="text-xs text-cyan-400 font-mono">61%</span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-1">
            <div className="bg-cyan-400 h-1 rounded-full" style={{ width: '61%' }}></div>
          </div>
        </div>
      </div>

      {/* Logout Button */}
      <div className="absolute bottom-4 left-3 right-3">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-400
            hover:bg-red-500/10 hover:text-red-300 transition-all border border-red-500/20 hover:border-red-500/50 rounded-lg"
        >
          <LogOut className="h-4 w-4 mr-3" />
          <span className="font-mono text-xs uppercase tracking-wider">Disconnect</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

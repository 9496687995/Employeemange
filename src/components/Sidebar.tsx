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
  LogOut
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
      bg-gradient-to-b from-white/80 via-rose-50/70 to-white/80 
      backdrop-blur-2xl border-r border-rose-100 shadow-[0_4px_20px_rgba(0,0,0,0.05)] rounded-r-3xl`}
    >
      {/* Brand Header */}
      <div className="flex items-center px-6 py-6 border-b border-rose-100/70">
        <div className="flex items-center space-x-2">
          <Building2 className="h-8 w-8 text-rose-400" />
          <span className="text-xl font-semibold text-rose-500">HRFlow</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="mt-6 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-4 py-3 mb-2 rounded-xl text-sm font-medium transition-all duration-200
              ${isActive
                ? 'bg-gradient-to-r from-rose-200 to-pink-100 text-rose-700 shadow-sm'
                : 'text-gray-600 hover:bg-white/80 hover:text-rose-500 hover:shadow-sm'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon
                  className={`h-5 w-5 mr-3 ${isActive ? 'text-rose-500' : 'text-rose-400/80'
                    }`}
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Logout Button */}
      <div className="absolute bottom-6 left-3 right-3">
        <button
          onClick={logout}
          className="flex items-center w-full px-4 py-3 rounded-xl text-sm font-medium text-rose-500
            hover:bg-gradient-to-r hover:from-rose-100 hover:to-pink-50 hover:shadow-md transition-all"
        >
          <LogOut className="h-5 w-5 mr-3 text-rose-400" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

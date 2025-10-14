import React, { useState, useEffect } from 'react';
import { Bell, Search } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployee } from '../contexts/EmployeeContext';
import NotificationsPanel from './NotificationsPanel';
import { notificationService } from '../services/notificationService';

const Header = () => {
  const { user } = useAuth();
  const { employees } = useEmployee();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const currentEmployee = employees.find((emp: any) => emp.id === user?.id);

  useEffect(() => {
    loadUnreadCount();
    const unsubscribe = notificationService.subscribeToNotifications(() => {
      loadUnreadCount();
    });
    return () => unsubscribe();
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      // For employees, show notifications about them. For admin, show all notifications
      const userId = user?.role === 'employee' ? user?.id : undefined;
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  return (
    <header
      className="bg-gradient-to-r from-purple-600 via-pink-500 to-red-500
                 backdrop-blur-xl border-b border-red-400/50 
                 px-6 py-4 shadow-lg transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        {/* 🔍 Search Bar */}
        <div className="flex items-center flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/70 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border border-white/30 rounded-lg 
                         focus:ring-2 focus:ring-pink-300 focus:border-transparent
                         bg-white/20 backdrop-blur-md text-white placeholder-white/70
                         shadow-sm"
            />
          </div>
        </div>

        {/* 🔔 Notification + Profile */}
        <div className="flex items-center space-x-6 ml-6">
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-lg bg-white/20 hover:bg-white/30
                       text-white hover:text-yellow-200 shadow-md transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* 🧑‍💼 User Info */}
          <div className="flex items-center space-x-4 border-l border-white/30 pl-4">
            {currentEmployee?.profilePicture ? (
              <img
                src={currentEmployee.profilePicture}
                alt={user?.name}
                className="w-10 h-10 rounded-full object-cover ring-2 ring-white/60"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div className="w-10 h-10 flex items-center justify-center rounded-full 
                              bg-gradient-to-br from-yellow-400 to-orange-400 text-white font-semibold shadow-md">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}

            <div className="flex flex-col">
              <p className="text-sm font-semibold text-white">{user?.name}</p>
              <p className="text-xs text-yellow-200 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </div>

      <NotificationsPanel
        isOpen={showNotifications}
        onClose={() => {
          setShowNotifications(false);
          loadUnreadCount();
        }}
      />
    </header>
  );
};

export default Header;

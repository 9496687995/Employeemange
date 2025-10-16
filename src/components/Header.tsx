import React, { useState, useEffect } from 'react';
import { Bell, Search, Activity } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useEmployee } from '../contexts/EmployeeContext';
import NotificationsPanel from './NotificationsPanel';
import { notificationService } from '../services/notificationService';

const Header = () => {
  const { user } = useAuth();
  const { employees } = useEmployee();
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());

  const currentEmployee = employees.find((emp: any) => emp.id === user?.id);

  useEffect(() => {
    loadUnreadCount();
    const unsubscribe = notificationService.subscribeToNotifications(() => {
      loadUnreadCount();
    });

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      unsubscribe();
      clearInterval(timer);
    };
  }, [user]);

  const loadUnreadCount = async () => {
    try {
      const userId = user?.role === 'employee' ? user?.id : undefined;
      const count = await notificationService.getUnreadCount(userId);
      setUnreadCount(count);
    } catch (error) {
      console.error('Failed to load unread count:', error);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <header className="bg-slate-900 border-b border-cyan-500/20 px-6 py-3 shadow-xl">
      <div className="flex items-center justify-between">
        {/* Live Indicator & Date */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-cyan-400 animate-pulse" />
            <span className="text-cyan-400 font-mono text-xs font-semibold uppercase tracking-wider">LIVE</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wide">{formatDate(currentTime)}</div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="text-xl font-mono font-bold text-cyan-400 tabular-nums">
            {formatTime(currentTime)}
          </div>
        </div>

        {/* Search & Actions */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 h-4 w-4" />
            <input
              type="text"
              placeholder="Search..."
              className="w-64 pl-10 pr-4 py-2 border border-slate-700 rounded-lg
                         focus:ring-2 focus:ring-cyan-500 focus:border-transparent
                         bg-slate-800 text-slate-300 placeholder-slate-500 text-sm font-mono"
            />
          </div>

          {/* System Status */}
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-xs text-slate-400 font-mono uppercase">Online</span>
          </div>

          {/* Notification Bell */}
          <button
            onClick={() => setShowNotifications(true)}
            className="relative p-2 rounded-lg bg-slate-800 hover:bg-slate-700
                       text-slate-400 hover:text-cyan-400 border border-slate-700 transition-all"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center font-mono">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* User Profile */}
          <div className="flex items-center gap-3 pl-4 border-l border-slate-700">
            {currentEmployee?.profilePicture ? (
              <img
                src={currentEmployee.profilePicture}
                alt={user?.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-cyan-500/50"
                onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling instanceof HTMLElement) {
                    e.currentTarget.nextElementSibling.style.display = 'flex';
                  }
                }}
              />
            ) : (
              <div className="w-9 h-9 flex items-center justify-center rounded-lg
                              bg-gradient-to-br from-cyan-500 to-blue-600 text-white font-bold text-sm">
                {user?.name
                  ?.split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}

            <div className="flex flex-col">
              <p className="text-sm font-semibold text-white font-mono">{user?.name}</p>
              <p className="text-xs text-cyan-400 uppercase font-mono tracking-wide">{user?.role}</p>
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

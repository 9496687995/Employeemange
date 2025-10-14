import { Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useEmployee } from '../contexts/EmployeeContext';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = () => {
  const { user } = useAuth();
  const { loading } = useEmployee();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <Sidebar />
      <div className={user?.role === 'employee' ? 'ml-56' : 'ml-64'}>
        <Header />
        <main className="p-6 min-h-screen bg-gradient-to-br from-slate-800 via-gray-800 to-slate-900">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Layout;
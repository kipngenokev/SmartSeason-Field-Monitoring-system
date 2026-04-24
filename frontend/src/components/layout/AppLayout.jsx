import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import { useAuth } from '../../context/AuthContext';

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/fields':    'Fields',
  '/updates':   'Field Updates',
  '/agents':    'Agents',
};

export default function AppLayout() {
  const { user } = useAuth();
  const { pathname } = useLocation();

  if (!user) return <Navigate to="/login" replace />;

  const title = pageTitles[pathname] ?? 'SmartSeason';

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />
      <div className="pl-64">
        <Navbar title={title} />
        <main className="pt-16">
          <div className="mx-auto max-w-7xl p-6 lg:p-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

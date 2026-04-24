import { useAuth } from '../context/AuthContext';
import AdminDashboard from '../components/dashboard/AdminDashboard';
import AgentDashboard from '../components/dashboard/AgentDashboard';

export default function DashboardPage() {
  const { user } = useAuth();
  return user?.role === 'Admin' ? <AdminDashboard /> : <AgentDashboard />;
}

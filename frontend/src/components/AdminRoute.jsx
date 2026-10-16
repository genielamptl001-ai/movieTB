import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#09090f]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent"></div>
        <p className="ml-3 text-sm text-slate-400">Verifying administrator credentials…</p>
      </div>
    );
  }

  // Not logged in -> send to dedicated admin login
  if (!user) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }

  // Logged in as customer -> strictly deny access to admin portal
  if (user.role !== 'admin') {
    return (
      <Navigate
        to="/admin/login"
        replace
        state={{ error: 'Access denied: Customer accounts cannot access the Administrator Portal.' }}
      />
    );
  }

  return children;
}

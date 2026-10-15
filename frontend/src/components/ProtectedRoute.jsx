import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <p className="py-20 text-center text-slate-400">Loading your account…</p>;
  return user ? children : <Navigate to="/login" replace state={{ from: location.pathname }} />;
}

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Ticket, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import Logo from './Logo';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#0a0a10]/90 backdrop-blur-md">
      <nav className="container-shell flex h-20 items-center justify-between">
        <Logo to="/" size="md" />

        <div className="flex items-center gap-5 text-sm text-slate-300 font-medium">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition hover:text-white ${isActive ? 'text-white font-bold' : ''}`
            }
          >
            Movies
          </NavLink>

          {user ? (
            <>
              <NavLink
                to="/bookings"
                className={({ isActive }) =>
                  `flex items-center gap-1.5 transition hover:text-white ${
                    isActive ? 'text-white font-bold' : ''
                  }`
                }
              >
                <Ticket size={16} className="text-rose-400" />
                <span>My Bookings</span>
              </NavLink>

              <span className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-slate-300 sm:flex">
                <UserRound size={13} className="text-amber-400" />
                {user.name}
              </span>

              <button
                onClick={signOut}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 transition"
              >
                <LogOut size={14} />
                <span>Sign out</span>
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-5 py-2 text-xs font-bold text-white shadow-lg shadow-rose-950 transition hover:opacity-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </nav>
    </header>
  );
}

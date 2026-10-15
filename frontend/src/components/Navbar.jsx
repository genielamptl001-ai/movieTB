import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Film, Ticket, LogOut, UserRound } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const signOut = () => { logout(); navigate('/'); };
  return (
    <header className="border-b border-white/10 bg-ink/90 backdrop-blur">
      <nav className="container-shell flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 text-xl font-black tracking-tight">
          <span className="rounded-lg bg-accent p-2"><Film size={19} /></span>
          <span>Screen<span className="text-accent">Time</span></span>
        </Link>
        <div className="flex items-center gap-5 text-sm text-slate-300">
          <NavLink to="/" className="hover:text-white">Movies</NavLink>
          {user ? <>
            <NavLink to="/bookings" className="flex items-center gap-1 hover:text-white"><Ticket size={16} /> My bookings</NavLink>
            <span className="hidden text-slate-400 sm:inline"><UserRound size={14} className="mr-1 inline" />{user.name}</span>
            <button onClick={signOut} className="flex items-center gap-1 hover:text-white"><LogOut size={16} /> Sign out</button>
          </> : <Link to="/login" className="rounded-full bg-accent px-4 py-2 font-semibold text-white hover:bg-rose-500">Sign in</Link>}
        </div>
      </nav>
    </header>
  );
}

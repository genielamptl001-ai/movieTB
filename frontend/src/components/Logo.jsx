import { Link } from 'react-router-dom';

export default function Logo({ to = '/', size = 'md', isAdmin = false, className = '' }) {
  const iconSizeClasses = {
    sm: 'h-8 w-8 rounded-lg',
    md: 'h-10 w-10 rounded-xl',
    lg: 'h-12 w-12 rounded-2xl'
  };

  const textClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl'
  };

  const content = (
    <div className={`flex items-center gap-2.5 font-display select-none ${className}`}>
      {/* Brand Icon Emblem */}
      <div
        className={`relative flex items-center justify-center bg-gradient-to-tr from-rose-600 via-rose-500 to-amber-500 text-white shadow-lg shadow-rose-600/30 ring-1 ring-white/20 transition-transform duration-300 group-hover:scale-105 ${
          iconSizeClasses[size] || iconSizeClasses.md
        }`}
      >
        {/* Cinema Film Clapper / Ticket SVG */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-5 w-5 drop-shadow-sm"
        >
          {/* Cinema ticket + reel path */}
          <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
          <path d="m10 15 5-3-5-3v6z" fill="currentColor" stroke="none" />
        </svg>

        {/* Ambient Corner Flare */}
        <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-400 blur-[2px]" />
      </div>

      {/* Brand Typography */}
      <div className="leading-tight">
        <div className={`flex items-center tracking-tight font-black ${textClasses[size] || textClasses.md}`}>
          <span className="text-white tracking-wide">BOOK</span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-amber-400 ml-0.5">
            MY
          </span>
          <span className="text-white ml-0.5 tracking-wider">
            CINEMA
          </span>
        </div>

        {isAdmin ? (
          <div className="flex items-center gap-1 mt-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-rose-400">
              Admin Portal
            </span>
          </div>
        ) : (
          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 hidden sm:block">
            Premier Movie Experience
          </p>
        )}
      </div>
    </div>
  );

  if (!to) {
    return <div className="group">{content}</div>;
  }

  return (
    <Link to={to} className="group transition-opacity hover:opacity-95">
      {content}
    </Link>
  );
}

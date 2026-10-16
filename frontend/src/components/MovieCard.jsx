import { Link } from 'react-router-dom';
import { Clock3, Star } from 'lucide-react';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

export default function MovieCard({ movie }) {
  const poster = movie.posterUrl || movie.poster_url || FALLBACK_POSTER;

  return (
    <Link
      to={`/movies/${movie._id || movie.id}`}
      className="group overflow-hidden rounded-2xl border border-white/10 bg-panel transition hover:-translate-y-1 hover:border-rose-400/60 shadow-lg"
    >
      <div className="poster-wrap relative bg-slate-900">
        <img
          src={poster}
          alt={`${movie.title} poster`}
          referrerPolicy="no-referrer"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          onError={(e) => {
            if (e.target.src !== FALLBACK_POSTER) {
              e.target.src = FALLBACK_POSTER;
            }
          }}
        />
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs backdrop-blur">
          {movie.language}
        </span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-bold text-white">{movie.title}</h3>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
          <span className="flex items-center gap-1">
            <Clock3 size={14} /> {movie.durationMinutes || movie.duration_minutes} min
          </span>
          <span className="flex items-center gap-1 text-amber-300">
            <Star size={14} fill="currentColor" /> {movie.rating || 'New'}
          </span>
        </div>
        <p className="mt-3 line-clamp-1 text-xs text-slate-500">
          {(movie.genre || []).join(' • ')}
        </p>
      </div>
    </Link>
  );
}

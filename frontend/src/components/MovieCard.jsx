import { Link } from 'react-router-dom';
import { Clock3, Star } from 'lucide-react';

export default function MovieCard({ movie }) {
  return (
    <Link to={`/movies/${movie._id}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-panel transition hover:-translate-y-1 hover:border-rose-400/60">
      <div className="poster-wrap">
        {movie.posterUrl ? <img src={movie.posterUrl} alt={`${movie.title} poster`} className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> :
          <div className="flex h-full items-center justify-center bg-slate-800 text-slate-500">No poster</div>}
        <span className="absolute left-3 top-3 rounded-full bg-black/70 px-3 py-1 text-xs">{movie.language}</span>
      </div>
      <div className="p-4">
        <h3 className="line-clamp-1 text-lg font-bold">{movie.title}</h3>
        <div className="mt-2 flex items-center justify-between text-sm text-slate-400">
          <span className="flex items-center gap-1"><Clock3 size={14} /> {movie.durationMinutes} min</span>
          <span className="flex items-center gap-1 text-amber-300"><Star size={14} fill="currentColor" /> {movie.rating || 'New'}</span>
        </div>
        <p className="mt-3 line-clamp-1 text-xs text-slate-500">{(movie.genre || []).join(' • ')}</p>
      </div>
    </Link>
  );
}

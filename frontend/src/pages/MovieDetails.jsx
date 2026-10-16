import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { CalendarDays, Clock3, Star, Ticket } from 'lucide-react';
import api from '../services/api';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

export default function MovieDetails() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [shows, setShows] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get(`/movies/${id}`), api.get('/shows', { params: { movieId: id } })])
      .then(([movieResponse, showResponse]) => {
        setMovie(movieResponse.data.movie);
        setShows(showResponse.data.shows);
      })
      .catch(() => setError('Movie or showtimes could not be loaded.'));
  }, [id]);

  if (error) return <div className="container-shell py-16 text-red-200">{error}</div>;
  if (!movie) return <div className="container-shell py-16 text-slate-400">Loading movie…</div>;

  const poster = movie.posterUrl || movie.poster_url || FALLBACK_POSTER;

  return (
    <main className="container-shell py-10">
      <Link to="/" className="text-sm text-slate-400 hover:text-white">
        ← All movies
      </Link>
      <div className="mt-6 grid gap-8 md:grid-cols-[280px_1fr]">
        <img
          src={poster}
          alt={`${movie.title} poster`}
          referrerPolicy="no-referrer"
          className="mx-auto max-h-[430px] w-full max-w-[280px] rounded-2xl object-cover shadow-2xl bg-slate-900"
          onError={(e) => {
            if (e.target.src !== FALLBACK_POSTER) {
              e.target.src = FALLBACK_POSTER;
            }
          }}
        />
        <div>
          <p className="font-semibold uppercase tracking-widest text-accent">
            {(movie.genre || []).join(' • ')}
          </p>
          <h1 className="mt-2 text-4xl font-black sm:text-5xl">{movie.title}</h1>
          <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">
            <span className="flex items-center gap-2">
              <Clock3 size={16} />
              {movie.durationMinutes || movie.duration_minutes} minutes
            </span>
            <span className="flex items-center gap-2">
              <Star size={16} className="text-amber-300" />
              {movie.rating}/10
            </span>
            <span>{movie.language}</span>
          </div>
          <p className="mt-6 max-w-2xl leading-7 text-slate-300">{movie.description}</p>
          <h2 className="mt-9 flex items-center gap-2 text-2xl font-bold">
            <Ticket className="text-accent" /> Choose a show
          </h2>
          {shows.length ? (
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {shows.map((show) => (
                <div key={show._id} className="rounded-xl border border-white/10 bg-panel p-4">
                  <p className="font-bold">{show.cinema}</p>
                  <p className="mt-1 text-sm text-slate-400">{show.screen}</p>
                  <p className="mt-3 flex items-center gap-2 text-sm">
                    <CalendarDays size={15} />
                    {new Date(show.startsAt).toLocaleString()}
                  </p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-bold">₹{show.price}</span>
                    <Link
                      to={`/book/${show._id}`}
                      className="rounded-full bg-accent px-4 py-2 text-sm font-bold hover:bg-rose-500 transition"
                    >
                      Book seats
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-slate-400">
              No future shows are available yet. Seed demo data in the backend.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}

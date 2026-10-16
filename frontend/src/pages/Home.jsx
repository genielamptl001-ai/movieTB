import { useEffect, useState } from 'react';
import { Search, Sparkles, Film, Ticket } from 'lucide-react';
import api from '../services/api';
import MovieCard from '../components/MovieCard';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/movies', { params: search ? { search } : {} })
      .then(({ data }) => {
        setMovies(data.movies);
        setError('');
      })
      .catch(() => setError('Could not load movies. Make sure the backend and database are running.'))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a10] via-[#0a0a10]/90 to-transparent" />
        <div className="container-shell relative py-20 sm:py-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-400/30 bg-rose-500/10 px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-rose-300 backdrop-blur">
            <Sparkles size={14} className="text-amber-400" />
            Welcome to BOOKMYCINEMA
          </span>

          <h1 className="max-w-3xl text-4xl font-black leading-tight sm:text-6xl font-display tracking-tight text-white">
            Book Big Screen Experiences.{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 via-rose-400 to-amber-400">
              In Seconds.
            </span>
          </h1>

          <p className="mt-5 max-w-xl text-base text-slate-300 leading-relaxed">
            Discover the latest blockbusters, select your preferred theatre seats in real-time, and confirm bookings instantly.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <a
              href="#movies"
              className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-7 py-3.5 font-bold text-white shadow-lg shadow-rose-950 transition hover:opacity-95"
            >
              <Ticket size={18} />
              Explore Showing Films
            </a>
          </div>
        </div>
      </section>

      <section id="movies" className="container-shell py-14">
        <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-widest text-rose-400">
              <Film size={14} />
              <span>Now In Theatres</span>
            </div>
            <h2 className="mt-1 text-3xl font-black font-display text-white tracking-tight sm:text-4xl">
              Trending Releases
            </h2>
          </div>

          <label className="flex items-center gap-2.5 rounded-xl border border-white/10 bg-[#12121e] px-4 py-3 sm:w-80 shadow-md">
            <Search size={18} className="text-slate-400" />
            <input
              aria-label="Search movies"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by movie title…"
              className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
            />
          </label>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-800 bg-red-950/60 p-4 text-sm text-red-200">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
            <p className="ml-3 text-slate-400">Loading catalog…</p>
          </div>
        ) : movies.length ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-12 text-center text-slate-400">
            No movies found matching your search.
          </div>
        )}
      </section>
    </>
  );
}

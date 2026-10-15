import { useEffect, useState } from 'react';
import { Search, Sparkles } from 'lucide-react';
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
      .then(({ data }) => { setMovies(data.movies); setError(''); })
      .catch(() => setError('Could not load movies. Make sure the backend and database are running.'))
      .finally(() => setLoading(false));
  }, [search]);

  return (
    <>
      <section className="hero relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/90 to-transparent" />
        <div className="container-shell relative py-20 sm:py-28">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-rose-200"><Sparkles size={14} /> Your next movie night</span>
          <h1 className="max-w-2xl text-4xl font-black leading-tight sm:text-6xl">Great stories.<br /><span className="text-accent">Big-screen</span> moments.</h1>
          <p className="mt-5 max-w-lg text-slate-300">Discover what's showing and reserve your seats in a few clicks.</p>
          <a href="#movies" className="mt-8 inline-block rounded-full bg-accent px-6 py-3 font-bold hover:bg-rose-500">Explore movies</a>
        </div>
      </section>
      <section id="movies" className="container-shell py-12">
        <div className="mb-7 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
          <div><p className="text-sm font-semibold uppercase tracking-widest text-accent">Now showing</p><h2 className="mt-1 text-3xl font-black">Find your film</h2></div>
          <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-panel px-4 py-3 sm:w-72"><Search size={18} className="text-slate-400" /><input aria-label="Search movies" value={search} onChange={e => setSearch(e.target.value)} placeholder="Search titles…" className="w-full bg-transparent outline-none placeholder:text-slate-500" /></label>
        </div>
        {error && <p className="mb-5 rounded-xl bg-red-950/50 p-4 text-red-200">{error}</p>}
        {loading ? <p className="py-12 text-center text-slate-400">Loading movies…</p> :
          movies.length ? <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{movies.map(movie => <MovieCard key={movie._id} movie={movie} />)}</div> :
          <p className="rounded-2xl border border-white/10 p-10 text-center text-slate-400">No movies found. Run <code>npm run seed</code> in the backend folder to add demo data.</p>}
      </section>
    </>
  );
}

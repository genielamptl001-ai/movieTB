import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';

const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
const seatList = rows.flatMap(row => Array.from({ length: 10 }, (_, i) => `${row}${i + 1}`));

export default function BookShow() {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [selected, setSelected] = useState([]);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    api.get('/shows').then(({ data }) => setShow(data.shows.find(s => s._id === showId) || null))
      .catch(() => setError('Could not load show details.'));
  }, [showId]);
  const total = useMemo(() => (show?.price || 0) * selected.length, [show, selected]);
  function toggle(seat) { setSelected(old => old.includes(seat) ? old.filter(s => s !== seat) : [...old, seat]); }
  async function submit() {
    setBusy(true); setError('');
    try {
      await api.post('/bookings', { showId, seats: selected });
      navigate('/bookings', { state: { success: 'Your seats have been booked.' } });
    } catch (err) { setError(err.response?.data?.message || 'Booking failed.'); }
    finally { setBusy(false); }
  }
  if (!show) return <main className="container-shell py-16"><p className="text-slate-400">{error || 'Loading show details…'}</p><Link to="/" className="mt-4 inline-block text-rose-300">Back to movies</Link></main>;
  return <main className="container-shell py-10">
    <Link to={`/movies/${show.movie?._id}`} className="text-sm text-slate-400 hover:text-white">← Back to movie</Link>
    <div className="mx-auto mt-6 max-w-3xl rounded-2xl border border-white/10 bg-panel p-5 sm:p-8">
      <h1 className="text-3xl font-black">Select your seats</h1><p className="mt-2 text-slate-400">{show.movie?.title} · {show.cinema} · {new Date(show.startsAt).toLocaleString()}</p>
      {error && <p className="mt-4 rounded-lg bg-red-950 p-3 text-sm text-red-200">{error}</p>}
      <div className="mx-auto mt-8 max-w-md"><div className="screen-shape mb-8 text-center text-xs font-bold uppercase tracking-[0.4em] text-slate-400">Screen</div>
        <div className="grid grid-cols-10 gap-2">{seatList.map(seat => <button key={seat} type="button" aria-pressed={selected.includes(seat)} onClick={() => toggle(seat)} className={`aspect-square rounded-md text-xs font-semibold transition ${selected.includes(seat) ? 'bg-accent text-white' : 'border border-emerald-400/30 bg-emerald-400/10 text-emerald-200 hover:bg-emerald-400/20'}`}>{seat}</button>)}</div>
        <div className="mt-5 flex justify-center gap-5 text-xs text-slate-400"><span>🟩 Available</span><span>🟥 Selected</span></div>
      </div>
      <div className="mt-8 flex flex-col justify-between gap-4 border-t border-white/10 pt-5 sm:flex-row sm:items-center"><div><p className="text-sm text-slate-400">{selected.length} seat(s) selected</p><p className="text-2xl font-black">₹{total}</p></div><button disabled={!selected.length || busy} onClick={submit} className="rounded-xl bg-accent px-6 py-3 font-bold disabled:cursor-not-allowed disabled:opacity-40">{busy ? 'Booking…' : 'Confirm booking'}</button></div>
      <p className="mt-3 text-xs text-slate-500">Seat availability is checked when you confirm. This demo does not process payments.</p>
    </div>
  </main>;
}

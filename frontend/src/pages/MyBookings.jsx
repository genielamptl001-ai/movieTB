import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TicketCheck } from 'lucide-react';
import api from '../services/api';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [error, setError] = useState('');
  const location = useLocation();
  useEffect(() => {
    api.get('/bookings/my').then(({ data }) => setBookings(data.bookings))
      .catch(() => setError('Could not load your bookings.'));
  }, []);
  return <main className="container-shell min-h-[70vh] py-12">
    <p className="text-sm font-bold uppercase tracking-widest text-accent">Your tickets</p><h1 className="mt-2 text-4xl font-black">My bookings</h1>
    {location.state?.success && <p className="mt-5 rounded-xl bg-emerald-950 p-4 text-emerald-200">{location.state.success}</p>}
    {error && <p className="mt-5 text-red-200">{error}</p>}
    {!error && !bookings.length ? <div className="mt-10 rounded-2xl border border-white/10 bg-panel p-10 text-center"><TicketCheck size={36} className="mx-auto text-slate-500" /><p className="mt-4 text-slate-300">You don't have any bookings yet.</p><Link to="/" className="mt-5 inline-block rounded-full bg-accent px-5 py-2 font-bold">Browse movies</Link></div> :
      <div className="mt-8 grid gap-4">{bookings.map(booking => <article key={booking._id} className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-panel p-5 sm:flex-row sm:items-center">
        {booking.show?.movie?.posterUrl && <img src={booking.show.movie.posterUrl} alt="" className="h-28 w-20 rounded-lg object-cover" />}
        <div className="flex-1"><h2 className="text-xl font-bold">{booking.show?.movie?.title || 'Movie'}</h2><p className="mt-1 text-sm text-slate-400">{booking.show?.cinema} · {booking.show?.screen}</p><p className="mt-1 text-sm text-slate-400">{booking.show?.startsAt ? new Date(booking.show.startsAt).toLocaleString() : 'Show details unavailable'}</p><p className="mt-2 text-sm">Seats: <span className="font-bold text-rose-200">{booking.seats.join(', ')}</span></p></div>
        <div className="sm:text-right"><p className="text-2xl font-black">₹{booking.totalAmount}</p><span className="mt-1 inline-block rounded-full bg-emerald-400/10 px-3 py-1 text-xs capitalize text-emerald-300">{booking.status}</span><p className="mt-2 text-xs text-slate-500">Ref: {booking._id.slice(-8).toUpperCase()}</p></div>
      </article>)}</div>}
  </main>;
}

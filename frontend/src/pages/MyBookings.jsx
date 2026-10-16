import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Ticket,
  TicketX,
  AlertTriangle,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  X,
  ArrowRight
} from 'lucide-react';
import api from '../services/api';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'confirmed' | 'cancelled'

  // Cancel Modal State
  const [cancellingBooking, setCancellingBooking] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);

  const location = useLocation();

  const fetchBookings = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/bookings/my');
      setBookings(data.bookings || []);
    } catch {
      setError('Could not load your bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
    if (location.state?.success) {
      setSuccessMsg(location.state.success);
    }
  }, [location.state]);

  const handleConfirmCancel = async () => {
    if (!cancellingBooking) return;
    setIsCancelling(true);
    setError('');

    try {
      const res = await api.patch(`/bookings/${cancellingBooking._id}/cancel`);
      setSuccessMsg(res.data.message || 'Booking cancelled successfully. Your seats have been released.');

      // Update state locally
      setBookings((prev) =>
        prev.map((b) =>
          b._id === cancellingBooking._id ? { ...b, status: 'cancelled' } : b
        )
      );
      setCancellingBooking(null);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel booking.');
    } finally {
      setIsCancelling(false);
    }
  };

  const filteredBookings = bookings.filter((b) => {
    if (filter === 'confirmed') return b.status === 'confirmed';
    if (filter === 'cancelled') return b.status === 'cancelled';
    return true;
  });

  return (
    <main className="container-shell min-h-[75vh] py-12">
      {/* Page Header */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-rose-400">
            Customer Dashboard
          </span>
          <h1 className="mt-1 text-3xl font-black font-display text-white sm:text-4xl tracking-tight">
            My Bookings
          </h1>
          <p className="mt-1 text-xs text-slate-400">
            View tickets, seat reservations, and manage your bookings.
          </p>
        </div>

        {bookings.length > 0 && (
          <div className="flex rounded-xl border border-white/10 bg-[#12121e] p-1 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === 'all'
                  ? 'bg-rose-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              All ({bookings.length})
            </button>
            <button
              onClick={() => setFilter('confirmed')}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === 'confirmed'
                  ? 'bg-emerald-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Confirmed ({bookings.filter((b) => b.status === 'confirmed').length})
            </button>
            <button
              onClick={() => setFilter('cancelled')}
              className={`rounded-lg px-3 py-1.5 transition ${
                filter === 'cancelled'
                  ? 'bg-red-500 text-white'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Cancelled ({bookings.filter((b) => b.status === 'cancelled').length})
            </button>
          </div>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-emerald-800 bg-emerald-950/80 p-4 text-sm text-emerald-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg('')} className="text-emerald-300 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {error && (
        <div className="mt-6 flex items-center justify-between rounded-xl border border-red-800 bg-red-950/80 p-4 text-sm text-red-200 shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-300 hover:text-white">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Content */}
      <div className="mt-8">
        {loading ? (
          <div className="flex min-h-[30vh] items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-rose-500 border-t-transparent" />
            <p className="ml-3 text-sm text-slate-400">Loading your tickets…</p>
          </div>
        ) : !bookings.length ? (
          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-12 text-center shadow-xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-slate-500">
              <Ticket size={32} />
            </div>
            <h3 className="mt-4 text-lg font-bold text-white">No Bookings Yet</h3>
            <p className="mt-1 text-xs text-slate-400 max-w-sm mx-auto">
              You haven't reserved any tickets yet. Explore now showing releases and pick your preferred seats!
            </p>
            <Link
              to="/"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-rose-500 to-amber-500 px-6 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-950 transition hover:opacity-95"
            >
              Explore Movies <ArrowRight size={14} />
            </Link>
          </div>
        ) : filteredBookings.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-10 text-center text-slate-400 text-sm">
            No {filter} bookings found.
          </div>
        ) : (
          <div className="grid gap-5">
            {filteredBookings.map((booking) => {
              const poster = booking.show?.movie?.posterUrl || FALLBACK_POSTER;
              const isConfirmed = booking.status === 'confirmed';

              return (
                <article
                  key={booking._id}
                  className={`flex flex-col gap-5 rounded-2xl border bg-[#12121e] p-5 shadow-xl transition sm:flex-row sm:items-center ${
                    isConfirmed
                      ? 'border-white/10 hover:border-white/20'
                      : 'border-red-950/40 opacity-75 bg-[#0f0f18]'
                  }`}
                >
                  {/* Poster Thumbnail */}
                  <img
                    src={poster}
                    alt={booking.show?.movie?.title || 'Movie'}
                    referrerPolicy="no-referrer"
                    className="h-32 w-24 rounded-xl object-cover bg-slate-900 shadow-md flex-shrink-0"
                    onError={(e) => {
                      if (e.target.src !== FALLBACK_POSTER) {
                        e.target.src = FALLBACK_POSTER;
                      }
                    }}
                  />

                  {/* Booking Details */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-bold font-display text-white">
                        {booking.show?.movie?.title || 'Movie'}
                      </h2>

                      {isConfirmed ? (
                        <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                          ● Confirmed
                        </span>
                      ) : (
                        <span className="rounded-full bg-red-500/10 border border-red-500/30 px-2.5 py-0.5 text-[11px] font-bold text-red-400 uppercase tracking-wider">
                          ✕ Cancelled
                        </span>
                      )}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-400">
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <MapPin size={13} className="text-rose-400" />
                        {booking.show?.cinema} · {booking.show?.screen}
                      </span>
                      <span className="flex items-center gap-1.5 text-slate-300">
                        <Clock size={13} className="text-amber-400" />
                        {booking.show?.startsAt
                          ? new Date(booking.show.startsAt).toLocaleString()
                          : 'Show details unavailable'}
                      </span>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-2">
                      <span className="text-xs text-slate-400">Reserved Seats:</span>
                      <div className="flex flex-wrap gap-1.5">
                        {booking.seats?.map((seat) => (
                          <span
                            key={seat}
                            className={`rounded-md border px-2 py-0.5 font-mono text-xs font-bold ${
                              isConfirmed
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                : 'bg-slate-800 border-slate-700 text-slate-500 line-through'
                            }`}
                          >
                            {seat}
                          </span>
                        ))}
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 font-mono pt-1">
                      Ref ID: #{booking._id.slice(-8).toUpperCase()}
                    </p>
                  </div>

                  {/* Pricing and Action */}
                  <div className="flex flex-col sm:items-end justify-between gap-3 border-t border-white/5 pt-4 sm:border-t-0 sm:pt-0 sm:pl-4">
                    <div className="sm:text-right">
                      <p className="text-2xl font-black font-display text-white">
                        ₹{booking.totalAmount}
                      </p>
                      <p className="text-[11px] text-slate-400">
                        {booking.seats?.length} {booking.seats?.length === 1 ? 'seat' : 'seats'}
                      </p>
                    </div>

                    {isConfirmed ? (
                      <button
                        onClick={() => setCancellingBooking(booking)}
                        className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-800/60 bg-red-950/40 px-4 py-2 text-xs font-bold text-red-300 hover:bg-red-900/60 transition shadow-sm"
                      >
                        <TicketX size={14} />
                        Cancel Booking
                      </button>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Seats released
                      </span>
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      {/* Cancel Confirmation Modal */}
      {cancellingBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-red-800/50 bg-[#12121e] p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-500/20 text-red-400">
              <AlertTriangle size={24} />
            </div>

            <h3 className="mt-4 text-xl font-bold font-display text-white">
              Cancel Ticket Booking?
            </h3>

            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              Are you sure you want to cancel your reservation for{' '}
              <span className="font-bold text-white">
                "{cancellingBooking.show?.movie?.title || 'this movie'}"
              </span>
              ?
            </p>

            <div className="mt-4 rounded-xl border border-white/5 bg-black/40 p-3.5 text-xs space-y-1.5">
              <div className="flex justify-between text-slate-400">
                <span>Cinema & Screen:</span>
                <span className="font-semibold text-white">
                  {cancellingBooking.show?.cinema} ({cancellingBooking.show?.screen})
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Seats to be released:</span>
                <span className="font-mono font-bold text-rose-300">
                  {cancellingBooking.seats?.join(', ')}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Total Amount:</span>
                <span className="font-bold text-white">
                  ₹{cancellingBooking.totalAmount}
                </span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-amber-300/90">
              ⚠️ Note: Your selected seats will be immediately released back for other customers to book.
            </p>

            <div className="mt-6 flex items-center justify-end gap-3 border-t border-white/10 pt-4">
              <button
                type="button"
                disabled={isCancelling}
                onClick={() => setCancellingBooking(null)}
                className="rounded-xl border border-white/10 px-4 py-2 text-xs font-semibold text-slate-300 hover:bg-white/5 hover:text-white transition"
              >
                Keep Booking
              </button>

              <button
                type="button"
                disabled={isCancelling}
                onClick={handleConfirmCancel}
                className="inline-flex items-center gap-1.5 rounded-xl bg-red-600 px-5 py-2 text-xs font-bold text-white transition hover:bg-red-500 disabled:opacity-50 shadow-md shadow-red-950"
              >
                {isCancelling ? 'Cancelling…' : 'Yes, Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

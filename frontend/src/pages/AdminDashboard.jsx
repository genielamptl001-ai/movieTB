import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Film,
  Calendar,
  Ticket,
  DollarSign,
  RefreshCw,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  Trash2,
  Armchair,
  CheckCircle2,
  AlertCircle,
  X,
  LogOut,
  Sparkles,
  BarChart3,
  Image as ImageIcon,
  Upload,
  Link as LinkIcon
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';

const FALLBACK_POSTER =
  'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

const CURATED_POSTERS = [
  {
    name: 'Sci-Fi Nebula',
    url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cyberpunk Neon',
    url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Dark Mystery',
    url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'City Noir',
    url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80'
  },
  {
    name: 'Cosmic Journey',
    url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80'
  }
];

function cleanImageUrl(input) {
  if (!input) return '';
  let url = input.trim();
  // If user pasted a Google Images search result link:
  if (url.includes('imgurl=')) {
    try {
      const match = url.match(/[?&]imgurl=([^&]+)/);
      if (match && match[1]) {
        url = decodeURIComponent(match[1]);
      }
    } catch {
      // fallback
    }
  }
  return url;
}

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [activeTab, setActiveTab] = useState('shows');

  // Add Movie Modal State
  const [isAddMovieModalOpen, setIsAddMovieModalOpen] = useState(false);
  const [submittingMovie, setSubmittingMovie] = useState(false);
  const [posterSourceType, setPosterSourceType] = useState('url'); // 'url' | 'upload' | 'preset'
  const [previewStatus, setPreviewStatus] = useState('idle'); // 'loading' | 'valid' | 'error' | 'idle'
  const fileInputRef = useRef(null);

  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    genre: 'Action, Sci-Fi',
    duration_minutes: 120,
    language: 'English',
    rating: 8.0,
    poster_url: CURATED_POSTERS[0].url,
    release_date: new Date().toISOString().split('T')[0],
    featured: false
  });

  // Deleting Movie State
  const [deletingMovieId, setDeletingMovieId] = useState(null);

  const fetchDashboard = async () => {
    setLoading(true);
    setError('');
    try {
      const { data } = await api.get('/admin/dashboard');
      setDashboard(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load administrator data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleAdminSignOut = () => {
    logout();
    navigate('/admin/login');
  };

  // Handle local file upload
  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please select a valid image file (JPG, PNG, WebP).');
      return;
    }

    setPreviewStatus('loading');
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Resize in canvas to max 800px width/height for fast and reliable storage
        const canvas = document.createElement('canvas');
        const maxDim = 800;
        let { width, height } = img;
        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
        setMovieForm((prev) => ({ ...prev, poster_url: dataUrl }));
        setPreviewStatus('valid');
      };
      img.onerror = () => {
        setPreviewStatus('error');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  // Add Movie
  const handleAddMovie = async (e) => {
    e.preventDefault();
    if (!movieForm.title.trim()) {
      setError('Movie title is required.');
      return;
    }

    setSubmittingMovie(true);
    setError('');
    try {
      const cleanPoster = cleanImageUrl(movieForm.poster_url) || FALLBACK_POSTER;
      const res = await api.post('/admin/movies', {
        ...movieForm,
        poster_url: cleanPoster,
        duration_minutes: Number(movieForm.duration_minutes),
        rating: Number(movieForm.rating)
      });
      setSuccessMsg(`"${res.data.movie?.title || 'Movie'}" added to catalog successfully!`);
      setIsAddMovieModalOpen(false);
      // Reset form
      setMovieForm({
        title: '',
        description: '',
        genre: 'Action, Sci-Fi',
        duration_minutes: 120,
        language: 'English',
        rating: 8.0,
        poster_url: CURATED_POSTERS[0].url,
        release_date: new Date().toISOString().split('T')[0],
        featured: false
      });
      setPreviewStatus('idle');
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add movie.');
    } finally {
      setSubmittingMovie(false);
    }
  };

  // Delete Movie
  const handleDeleteMovie = async (movieId, movieTitle) => {
    if (!window.confirm(`Are you sure you want to delete "${movieTitle}"? This will also remove all scheduled shows for this movie.`)) {
      return;
    }

    setDeletingMovieId(movieId);
    setError('');
    try {
      await api.delete(`/admin/movies/${movieId}`);
      setSuccessMsg(`"${movieTitle}" deleted successfully.`);
      fetchDashboard();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete movie.');
    } finally {
      setDeletingMovieId(null);
    }
  };

  // Pre-fill demo data helper
  const handlePreFillSample = () => {
    const samples = [
      {
        title: 'Cyber Mirage 2099',
        description: 'In a neon-drenched metropolis, an AI investigator uncovers a memory conspiracy that threatens humanity.',
        genre: 'Sci-Fi, Cyberpunk, Action',
        duration_minutes: 142,
        language: 'English',
        rating: 8.7,
        poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80',
        release_date: '2026-11-20',
        featured: true
      },
      {
        title: 'Whispers in the Pines',
        description: 'A botanist searching for a rare nocturnal flower in an ancient forest realizes they are being watched.',
        genre: 'Mystery, Thriller',
        duration_minutes: 108,
        language: 'English',
        rating: 7.9,
        poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80',
        release_date: '2026-12-05',
        featured: false
      }
    ];
    const picked = samples[Math.floor(Math.random() * samples.length)];
    setMovieForm({ ...picked });
    setPreviewStatus('loading');
  };

  return (
    <div className="min-h-screen bg-[#0a0a10] text-slate-100">
      {/* Admin Dedicated Header */}
      <header className="sticky top-0 z-30 border-b border-white/10 bg-[#0f0f18]/95 backdrop-blur">
        <div className="container-shell flex h-16 items-center justify-between">
          <Logo to="/admin" size="md" isAdmin={true} />

          <div className="flex items-center gap-4 text-xs">
            <div className="hidden sm:block text-right">
              <p className="font-semibold text-white">{user?.email}</p>
              <p className="text-[11px] text-emerald-400">● Administrator</p>
            </div>

            <button
              onClick={fetchDashboard}
              disabled={loading}
              title="Refresh Data"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-medium text-slate-300 hover:bg-white/10 transition disabled:opacity-50"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin text-rose-400' : ''} />
              <span className="hidden md:inline">Refresh</span>
            </button>

            <button
              onClick={handleAdminSignOut}
              className="flex items-center gap-1.5 rounded-lg bg-red-950/40 border border-red-800/60 px-3 py-2 font-semibold text-red-300 hover:bg-red-900/60 transition"
            >
              <LogOut size={14} />
              <span>Admin Logout</span>
            </button>
          </div>
        </div>
      </header>

      <main className="container-shell py-8">
        {/* Alerts */}
        {error && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-red-800 bg-red-950/80 p-4 text-sm text-red-200 shadow-lg">
            <div className="flex items-center gap-2">
              <AlertCircle size={18} className="text-red-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-300 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 flex items-center justify-between rounded-xl border border-emerald-800 bg-emerald-950/80 p-4 text-sm text-emerald-200 shadow-lg">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={18} className="text-emerald-400 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
            <button onClick={() => setSuccessMsg('')} className="text-emerald-300 hover:text-white">
              <X size={16} />
            </button>
          </div>
        )}

        {/* Global KPI Metrics */}
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Bookings</span>
              <Ticket size={18} className="text-rose-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-white">
              {loading ? '…' : dashboard?.stats?.totalBookings ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Customer orders</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Seats Booked</span>
              <Armchair size={18} className="text-amber-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-amber-400">
              {loading ? '…' : dashboard?.stats?.totalSeatsBooked ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Reserved seats</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Seats Left</span>
              <Armchair size={18} className="text-emerald-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-emerald-400">
              {loading ? '…' : dashboard?.stats?.totalSeatsLeft ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Available to book</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-[#12121e] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Active Shows</span>
              <Calendar size={18} className="text-blue-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-white">
              {loading ? '…' : dashboard?.stats?.totalShows ?? 0}
            </p>
            <p className="mt-1 text-xs text-slate-400">Screening sessions</p>
          </div>

          <div className="col-span-2 sm:col-span-1 rounded-2xl border border-white/10 bg-[#12121e] p-5 shadow-lg">
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Revenue</span>
              <DollarSign size={18} className="text-purple-400" />
            </div>
            <p className="mt-2 text-3xl font-black text-white">
              {loading ? '…' : `₹${Number(dashboard?.stats?.totalRevenue || 0).toLocaleString()}`}
            </p>
            <p className="mt-1 text-xs text-slate-400">Gross sales</p>
          </div>
        </div>

        {/* Action Bar & Tabs */}
        <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-white/10 pb-4">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setActiveTab('shows')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'shows'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <BarChart3 size={15} />
              Shows & Seat Availability ({dashboard?.shows?.length ?? 0})
            </button>

            <button
              onClick={() => setActiveTab('movies')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'movies'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Film size={15} />
              Movies Catalog ({dashboard?.movies?.length ?? 0})
            </button>

            <button
              onClick={() => setActiveTab('bookings')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition ${
                activeTab === 'bookings'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-950'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Ticket size={15} />
              All Bookings ({dashboard?.bookings?.length ?? 0})
            </button>
          </div>

          {activeTab === 'movies' && (
            <button
              onClick={() => {
                setIsAddMovieModalOpen(true);
                setPreviewStatus('valid');
              }}
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 px-4 py-2 text-xs font-bold text-white shadow-lg transition hover:opacity-95"
            >
              <Plus size={16} />
              Add New Movie
            </button>
          )}
        </div>

        {/* Tab 1: Shows & Seat Availability */}
        {activeTab === 'shows' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>Tracking live bookings, booked seat identifiers, and remaining capacity for each showtime.</p>
              <span className="hidden sm:inline">Capacity per screen: 60 seats (A1–F10)</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading show and seat records…</div>
            ) : dashboard?.shows?.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#12121e] p-12 text-center text-slate-400">
                No shows scheduled yet. Add a movie and schedule shows to begin seat tracking.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                {dashboard?.shows?.map((show) => {
                  const percentBooked = show.occupancyPercentage || 0;
                  const posterUrl = show.movie?.posterUrl || show.movie?.poster_url || FALLBACK_POSTER;

                  return (
                    <div
                      key={show._id}
                      className="rounded-2xl border border-white/10 bg-[#12121e] p-6 shadow-xl transition hover:border-white/20"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3">
                          <img
                            src={posterUrl}
                            alt={show.movie?.title}
                            referrerPolicy="no-referrer"
                            className="h-16 w-12 rounded-lg object-cover bg-slate-800 flex-shrink-0"
                            onError={(e) => {
                              if (e.target.src !== FALLBACK_POSTER) {
                                e.target.src = FALLBACK_POSTER;
                              }
                            }}
                          />

                          <div>
                            <h3 className="font-bold text-base text-white">
                              {show.movie?.title || 'Unknown Movie'}
                            </h3>
                            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
                              <span className="flex items-center gap-1 text-slate-300">
                                <MapPin size={12} className="text-rose-400" />
                                {show.cinema} ({show.screen})
                              </span>
                              <span className="flex items-center gap-1 text-slate-300">
                                <Clock size={12} className="text-amber-400" />
                                {new Date(show.startsAt).toLocaleDateString()} at{' '}
                                {new Date(show.startsAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <p className="mt-1 font-semibold text-xs text-rose-300">
                              Ticket Price: ₹{show.price}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-xs font-semibold text-slate-300">
                            {show.bookingCount} {show.bookingCount === 1 ? 'Booking' : 'Bookings'}
                          </span>
                        </div>
                      </div>

                      {/* Seat Metrics Row */}
                      <div className="mt-5 grid grid-cols-3 gap-3 rounded-xl border border-white/5 bg-black/30 p-3.5 text-center">
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Booked</p>
                          <p className="mt-0.5 text-xl font-black text-amber-400">
                            {show.bookedSeatsCount}
                          </p>
                          <p className="text-[10px] text-slate-500">Seats filled</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Seats Left</p>
                          <p className="mt-0.5 text-xl font-black text-emerald-400">
                            {show.seatsLeft}
                          </p>
                          <p className="text-[10px] text-slate-500">Available</p>
                        </div>
                        <div>
                          <p className="text-[11px] font-semibold text-slate-400 uppercase">Capacity</p>
                          <p className="mt-0.5 text-xl font-black text-white">
                            {show.totalSeats}
                          </p>
                          <p className="text-[10px] text-slate-500">Total size</p>
                        </div>
                      </div>

                      {/* Visual Occupancy Bar */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-xs text-slate-400 mb-1.5">
                          <span>Occupancy Rate</span>
                          <span className="font-semibold text-white">{percentBooked}% full</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              percentBooked > 80
                                ? 'bg-red-500'
                                : percentBooked > 40
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, Math.max(0, percentBooked))}%` }}
                          />
                        </div>
                      </div>

                      {/* Booked Seat Badges */}
                      <div className="mt-4 border-t border-white/5 pt-3">
                        <p className="text-[11px] font-semibold text-slate-400 uppercase mb-2">
                          Booked Seat Identifiers:
                        </p>
                        {show.bookedSeatsList && show.bookedSeatsList.length > 0 ? (
                          <div className="flex flex-wrap gap-1.5">
                            {show.bookedSeatsList.map((seat) => (
                              <span
                                key={seat}
                                className="rounded bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 font-mono text-[11px] font-bold text-rose-300"
                              >
                                {seat}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <p className="text-xs text-slate-500 italic">
                            All {show.totalSeats} seats currently available for this show.
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Movies Catalog & Management */}
        {activeTab === 'movies' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>Add new titles or delete obsolete movies from the active catalogue.</p>
              <span>{dashboard?.movies?.length ?? 0} movies in database</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading catalog…</div>
            ) : dashboard?.movies?.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#12121e] p-12 text-center text-slate-400">
                No movies in database. Click "Add New Movie" above to add one.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {dashboard?.movies?.map((movie) => {
                  const poster = movie.posterUrl || movie.poster_url || FALLBACK_POSTER;

                  return (
                    <div
                      key={movie._id}
                      className="flex flex-col justify-between overflow-hidden rounded-2xl border border-white/10 bg-[#12121e] shadow-xl transition hover:border-white/20"
                    >
                      <div>
                        <div className="relative aspect-[16/9] w-full overflow-hidden bg-slate-900">
                          <img
                            src={poster}
                            alt={movie.title}
                            referrerPolicy="no-referrer"
                            className="h-full w-full object-cover transition duration-300 hover:scale-105"
                            onError={(e) => {
                              if (e.target.src !== FALLBACK_POSTER) {
                                e.target.src = FALLBACK_POSTER;
                              }
                            }}
                          />
                          {movie.featured && (
                            <span className="absolute top-3 left-3 rounded-full bg-rose-500/90 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-white backdrop-blur">
                              Featured
                            </span>
                          )}
                          <span className="absolute bottom-3 right-3 rounded-lg bg-black/80 px-2 py-0.5 text-xs font-black text-amber-300 backdrop-blur">
                            ★ {movie.rating}
                          </span>
                        </div>

                        <div className="p-5">
                          <h3 className="text-lg font-black text-white">{movie.title}</h3>
                          <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                            <span>{movie.durationMinutes || movie.duration_minutes} mins</span>
                            <span>•</span>
                            <span>{movie.language}</span>
                            {movie.release_date && (
                              <>
                                <span>•</span>
                                <span>{movie.release_date}</span>
                              </>
                            )}
                          </div>

                          <p className="mt-2 text-xs text-slate-300 line-clamp-2">
                            {movie.description || 'No description provided.'}
                          </p>

                          <div className="mt-3 flex flex-wrap gap-1.5">
                            {movie.genre?.map((g) => (
                              <span
                                key={g}
                                className="rounded-md bg-white/5 border border-white/10 px-2 py-0.5 text-[11px] text-slate-300"
                              >
                                {g}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 bg-black/20 p-4">
                        <button
                          onClick={() => handleDeleteMovie(movie._id, movie.title)}
                          disabled={deletingMovieId === movie._id}
                          className="flex w-full items-center justify-center gap-1.5 rounded-xl border border-red-800/60 bg-red-950/40 py-2.5 text-xs font-bold text-red-300 transition hover:bg-red-900/60 disabled:opacity-50"
                        >
                          <Trash2 size={14} />
                          {deletingMovieId === movie._id ? 'Deleting Movie…' : 'Delete Movie'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: All Bookings */}
        {activeTab === 'bookings' && (
          <div className="mt-6 space-y-4">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <p>Full record of customer ticket purchases.</p>
              <span>{dashboard?.bookings?.length ?? 0} total bookings</span>
            </div>

            {loading ? (
              <div className="py-20 text-center text-slate-500">Loading bookings…</div>
            ) : dashboard?.bookings?.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-[#12121e] p-12 text-center text-slate-400">
                No customer bookings recorded yet.
              </div>
            ) : (
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#12121e]">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="border-b border-white/10 bg-white/5 text-xs uppercase tracking-wider text-slate-400">
                      <tr>
                        <th className="px-6 py-4">Booking ID</th>
                        <th className="px-6 py-4">Customer</th>
                        <th className="px-6 py-4">Movie & Venue</th>
                        <th className="px-6 py-4">Seats Reserved</th>
                        <th className="px-6 py-4">Amount Paid</th>
                        <th className="px-6 py-4">Status</th>
                        <th className="px-6 py-4">Booking Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {dashboard?.bookings?.map((b) => (
                        <tr key={b.id} className="hover:bg-white/5 transition">
                          <td className="px-6 py-4 font-mono text-xs text-slate-400">
                            {b.id.slice(0, 8)}…
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{b.users?.name || 'Customer'}</p>
                            <p className="text-xs text-slate-400">{b.users?.email}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="font-semibold text-white">{b.shows?.movies?.title || 'Movie'}</p>
                            <p className="text-xs text-slate-400">
                              {b.shows?.cinema} • {b.shows?.screen}
                            </p>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex flex-wrap gap-1">
                              {b.seats?.map((seat) => (
                                <span
                                  key={seat}
                                  className="rounded bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 font-mono text-[11px] font-bold text-rose-300"
                                >
                                  {seat}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="px-6 py-4 font-bold text-white">
                            ₹{b.total_amount}
                          </td>
                          <td className="px-6 py-4">
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                b.status === 'confirmed'
                                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                  : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              }`}
                            >
                              {b.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs text-slate-400">
                            {new Date(b.created_at).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Add Movie Modal */}
      {isAddMovieModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-[#12121e] p-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/20 text-rose-400">
                  <Film size={18} />
                </span>
                <h2 className="text-lg font-black text-white">Add New Movie to Catalog</h2>
              </div>
              <button
                onClick={() => setIsAddMovieModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddMovie} className="mt-5 space-y-4">
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handlePreFillSample}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300 hover:bg-amber-500/20 transition"
                >
                  <Sparkles size={13} />
                  Pre-fill Sample Movie Data
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Movie Title *
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g. Interstellar Odyssey"
                  value={movieForm.title}
                  onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Duration (Minutes)
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    max="500"
                    value={movieForm.duration_minutes}
                    onChange={(e) => setMovieForm({ ...movieForm, duration_minutes: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Language
                  </label>
                  <input
                    required
                    type="text"
                    value={movieForm.language}
                    onChange={(e) => setMovieForm({ ...movieForm, language: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Rating (0 to 10)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={movieForm.rating}
                    onChange={(e) => setMovieForm({ ...movieForm, rating: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-slate-400">
                    Release Date
                  </label>
                  <input
                    type="date"
                    value={movieForm.release_date}
                    onChange={(e) => setMovieForm({ ...movieForm, release_date: e.target.value })}
                    className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Genres (Comma separated)
                </label>
                <input
                  type="text"
                  placeholder="Action, Sci-Fi, Thriller"
                  value={movieForm.genre}
                  onChange={(e) => setMovieForm({ ...movieForm, genre: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              {/* Poster Section with Dual Modes: Upload or Paste URL */}
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-semibold uppercase text-slate-300">
                    Movie Poster *
                  </label>
                  <div className="flex rounded-lg border border-white/10 bg-black/40 p-0.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setPosterSourceType('upload')}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition ${
                        posterSourceType === 'upload'
                          ? 'bg-rose-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <Upload size={12} />
                      Upload File
                    </button>
                    <button
                      type="button"
                      onClick={() => setPosterSourceType('url')}
                      className={`flex items-center gap-1 rounded-md px-2.5 py-1 font-semibold transition ${
                        posterSourceType === 'url'
                          ? 'bg-rose-500 text-white'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      <LinkIcon size={12} />
                      Web URL
                    </button>
                  </div>
                </div>

                {/* File Upload Mode */}
                {posterSourceType === 'upload' && (
                  <div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <div
                      onClick={() => fileInputRef.current?.click()}
                      className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-white/20 bg-black/20 p-5 text-center transition hover:border-rose-500 hover:bg-black/40"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-500/20 text-rose-400">
                        <Upload size={20} />
                      </div>
                      <p className="mt-2 text-xs font-bold text-white">
                        Click to select an image from your computer
                      </p>
                      <p className="mt-1 text-[11px] text-slate-400">
                        Supports PNG, JPG, JPEG, WebP. Automatically optimized.
                      </p>
                    </div>
                  </div>
                )}

                {/* Web Link Mode */}
                {posterSourceType === 'url' && (
                  <div>
                    <input
                      type="text"
                      placeholder="Paste image link (e.g. https://... or Google image link)"
                      value={movieForm.poster_url}
                      onChange={(e) => {
                        const cleaned = cleanImageUrl(e.target.value);
                        setMovieForm({ ...movieForm, poster_url: cleaned });
                        setPreviewStatus('loading');
                      }}
                      className="w-full rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white placeholder-slate-600 focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 font-mono"
                    />
                    <p className="mt-1 text-[11px] text-slate-400">
                      Tip: You can paste direct image links or use the upload button above.
                    </p>
                  </div>
                )}

                {/* Quick Poster Presets */}
                <div className="pt-2 border-t border-white/5">
                  <p className="text-[11px] font-semibold text-slate-400 uppercase">
                    Curated Poster Presets (1-Click Select):
                  </p>
                  <div className="mt-2 grid grid-cols-5 gap-2">
                    {CURATED_POSTERS.map((curated) => {
                      const isSelected = movieForm.poster_url === curated.url;
                      return (
                        <button
                          key={curated.name}
                          type="button"
                          onClick={() => {
                            setMovieForm({ ...movieForm, poster_url: curated.url });
                            setPreviewStatus('valid');
                          }}
                          className={`relative overflow-hidden rounded-lg border text-left transition ${
                            isSelected
                              ? 'border-rose-500 ring-2 ring-rose-500/50'
                              : 'border-white/10 hover:border-white/30'
                          }`}
                        >
                          <img
                            src={curated.url}
                            alt={curated.name}
                            referrerPolicy="no-referrer"
                            className="aspect-[3/4] w-full object-cover"
                          />
                          <span className="block truncate p-1 text-[10px] font-medium text-slate-300 bg-black/60">
                            {curated.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Live Preview Display */}
                <div className="mt-3 rounded-lg border border-white/10 bg-black/40 p-3">
                  <div className="flex items-center gap-3">
                    <div className="relative h-20 w-14 overflow-hidden rounded-md border border-white/10 bg-slate-800 flex-shrink-0">
                      {movieForm.poster_url ? (
                        <img
                          src={movieForm.poster_url}
                          alt="Poster Preview"
                          referrerPolicy="no-referrer"
                          className="h-full w-full object-cover"
                          onLoad={() => setPreviewStatus('valid')}
                          onError={() => {
                            setPreviewStatus('error');
                          }}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-600">
                          <ImageIcon size={20} />
                        </div>
                      )}
                    </div>

                    <div className="text-xs flex-1">
                      <p className="font-semibold text-white">Poster Preview Status</p>
                      {previewStatus === 'valid' && (
                        <p className="mt-1 flex items-center gap-1.5 text-emerald-400 font-medium">
                          <CheckCircle2 size={13} />
                          Poster ready and recognized!
                        </p>
                      )}
                      {previewStatus === 'error' && (
                        <div className="mt-1 text-amber-300 space-y-1">
                          <p className="flex items-center gap-1.5 font-medium">
                            <AlertCircle size={13} className="text-amber-400" />
                            This link cannot be loaded directly by the browser.
                          </p>
                          <div className="flex items-center gap-2 pt-0.5">
                            <button
                              type="button"
                              onClick={() => {
                                setPosterSourceType('upload');
                                fileInputRef.current?.click();
                              }}
                              className="text-[11px] underline text-rose-300 hover:text-white"
                            >
                              Upload image file instead
                            </button>
                            <span className="text-slate-500">•</span>
                            <button
                              type="button"
                              onClick={() => {
                                setMovieForm({ ...movieForm, poster_url: FALLBACK_POSTER });
                                setPreviewStatus('valid');
                              }}
                              className="text-[11px] underline text-slate-400 hover:text-white"
                            >
                              Use default poster
                            </button>
                          </div>
                        </div>
                      )}
                      {previewStatus === 'loading' && (
                        <p className="mt-1 text-slate-400">Loading poster preview…</p>
                      )}
                      {previewStatus === 'idle' && (
                        <p className="mt-1 text-slate-400">Choose a file, paste a link, or pick a preset.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-slate-400">
                  Description / Synopsis
                </label>
                <textarea
                  rows={3}
                  placeholder="Plot summary or overview..."
                  value={movieForm.description}
                  onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="featured"
                  checked={movieForm.featured}
                  onChange={(e) => setMovieForm({ ...movieForm, featured: e.target.checked })}
                  className="h-4 w-4 rounded border-white/20 bg-white/5 text-rose-500 focus:ring-rose-500"
                />
                <label htmlFor="featured" className="text-xs font-medium text-slate-300">
                  Highlight as Featured Movie on Customer Homepage
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
                <button
                  type="button"
                  onClick={() => setIsAddMovieModalOpen(false)}
                  className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-semibold text-slate-400 hover:bg-white/5 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingMovie}
                  className="flex items-center gap-2 rounded-xl bg-accent px-5 py-2.5 text-xs font-bold text-white transition hover:bg-rose-500 disabled:opacity-50"
                >
                  {submittingMovie ? 'Saving Movie…' : 'Add Movie'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

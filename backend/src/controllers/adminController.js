// Admin controller
import { supabase } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// Returns comprehensive overview data for admin dashboard
export const getDashboard = asyncHandler(async (req, res) => {
  // 1. Fetch all movies
  const { data: movies, error: moviesError } = await supabase
    .from('movies')
    .select('*')
    .order('created_at', { ascending: false });
  if (moviesError) throw moviesError;

  // 2. Fetch all shows with movie details
  const { data: shows, error: showsError } = await supabase
    .from('shows')
    .select('id, movie_id, cinema, screen, starts_at, price, total_seats, created_at, movies(id, title, poster_url, duration_minutes)')
    .order('starts_at', { ascending: true });
  if (showsError) throw showsError;

  // 3. Fetch all bookings with user and show info
  const { data: bookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('id, user_id, show_id, seats, total_amount, status, created_at, shows(id, cinema, screen, starts_at, movies(id, title)), users(id, name, email)')
    .order('created_at', { ascending: false });
  if (bookingsError) throw bookingsError;

  // 4. Calculate seat occupancy and counts per show
  const formattedShows = (shows || []).map((s) => {
    const showBookings = (bookings || []).filter(
      (b) => b.show_id === s.id && b.status === 'confirmed'
    );
    const bookedSeatsList = [...new Set(showBookings.flatMap((b) => b.seats || []))];
    const totalCapacity = Number(s.total_seats || 60);
    const bookedCount = bookedSeatsList.length;
    const seatsRemaining = Math.max(0, totalCapacity - bookedCount);
    const occupancyPercentage =
      totalCapacity > 0 ? Math.round((bookedCount / totalCapacity) * 100) : 0;

    return {
      _id: s.id,
      movieId: s.movie_id,
      cinema: s.cinema,
      screen: s.screen,
      startsAt: s.starts_at,
      price: Number(s.price),
      totalSeats: totalCapacity,
      bookedSeatsCount: bookedCount,
      seatsLeft: seatsRemaining,
      bookedSeatsList,
      occupancyPercentage,
      bookingCount: showBookings.length,
      movie: s.movies
        ? {
            _id: s.movies.id,
            title: s.movies.title,
            posterUrl: s.movies.poster_url,
            durationMinutes: s.movies.duration_minutes
          }
        : null
    };
  });

  // 5. Aggregate overall metrics
  const confirmedBookings = (bookings || []).filter((b) => b.status === 'confirmed');
  const totalRevenue = confirmedBookings.reduce((sum, b) => sum + Number(b.total_amount || 0), 0);
  const totalSeatsBooked = formattedShows.reduce((sum, s) => sum + s.bookedSeatsCount, 0);
  const totalSeatsCapacity = formattedShows.reduce((sum, s) => sum + s.totalSeats, 0);
  const totalSeatsLeft = Math.max(0, totalSeatsCapacity - totalSeatsBooked);

  res.json({
    stats: {
      totalMovies: movies ? movies.length : 0,
      totalShows: formattedShows.length,
      totalBookings: confirmedBookings.length,
      totalSeatsBooked,
      totalSeatsLeft,
      totalSeatsCapacity,
      totalRevenue
    },
    movies: (movies || []).map((m) => ({
      ...m,
      _id: m.id,
      durationMinutes: m.duration_minutes,
      posterUrl: m.poster_url,
      poster_url: m.poster_url
    })),
    shows: formattedShows,
    bookings: bookings || []
  });
});

// Admin add movie
export const createMovie = asyncHandler(async (req, res) => {
  const {
    title,
    description = '',
    genre = [],
    duration_minutes = 120,
    language = 'English',
    rating = 7.0,
    release_date = null,
    featured = false
  } = req.body;

  const rawPoster = req.body.poster_url || req.body.posterUrl || '';
  const cleanPoster = String(rawPoster).trim() || 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80';

  if (!title || !title.trim()) {
    return res.status(400).json({ message: 'Movie title is required.' });
  }

  // Parse genre if string
  let parsedGenre = genre;
  if (typeof genre === 'string') {
    parsedGenre = genre
      .split(',')
      .map((g) => g.trim())
      .filter(Boolean);
  }

  const { data: movie, error } = await supabase
    .from('movies')
    .insert({
      title: title.trim(),
      description: description.trim(),
      genre: parsedGenre,
      duration_minutes: Number(duration_minutes) || 120,
      language: language.trim() || 'English',
      rating: Math.min(10, Math.max(0, Number(rating) || 0)),
      poster_url: cleanPoster,
      release_date: release_date || null,
      featured: Boolean(featured)
    })
    .select('*')
    .single();

  if (error) throw error;
  res.status(201).json({
    message: 'Movie added successfully',
    movie: {
      ...movie,
      _id: movie.id,
      durationMinutes: movie.duration_minutes,
      posterUrl: movie.poster_url,
      poster_url: movie.poster_url
    }
  });
});

// Admin delete movie
export const deleteMovie = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('movies').delete().eq('id', id);
  if (error) throw error;
  res.json({ message: 'Movie and its scheduled shows were deleted successfully.' });
});

// Admin add show for a movie
export const createShow = asyncHandler(async (req, res) => {
  const { movie_id, cinema, screen = 'Screen 1', starts_at, price, total_seats = 60 } = req.body;
  if (!movie_id || !cinema || !starts_at || !price) {
    return res.status(400).json({ message: 'Movie, cinema, starts_at, and price are required.' });
  }

  const { data: show, error } = await supabase
    .from('shows')
    .insert({
      movie_id,
      cinema: cinema.trim(),
      screen: screen.trim(),
      starts_at,
      price: Number(price),
      total_seats: Number(total_seats) || 60
    })
    .select('*, movies(id, title)')
    .single();

  if (error) throw error;
  res.status(201).json({ message: 'Show scheduled successfully', show });
});

// Admin delete show
export const deleteShow = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { error } = await supabase.from('shows').delete().eq('id', id);
  if (error) throw error;
  res.json({ message: 'Show deleted successfully.' });
});

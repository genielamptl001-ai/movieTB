import { supabase } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getShows = asyncHandler(async (req, res) => {
  let query = supabase.from('shows')
    .select('id,movie_id,cinema,screen,starts_at,price,total_seats,movies(id,title,poster_url,duration_minutes)')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true });
  if (req.query.movieId) query = query.eq('movie_id', req.query.movieId);
  const { data, error } = await query;
  if (error) throw error;
  const shows = (data || []).map(s => ({
    _id: s.id, movieId: s.movie_id, cinema: s.cinema, screen: s.screen,
    startsAt: s.starts_at, price: Number(s.price), totalSeats: s.total_seats,
    movie: s.movies ? { _id: s.movies.id, title: s.movies.title, posterUrl: s.movies.poster_url, durationMinutes: s.movies.duration_minutes } : null
  }));
  res.json({ shows });
});

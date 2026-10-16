import { supabase } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const getMovies = asyncHandler(async (req, res) => {
  let query = supabase.from('movies').select('*').order('featured', { ascending: false }).order('created_at', { ascending: false });
  if (req.query.search) query = query.ilike('title', `%${String(req.query.search).replace(/[%_]/g, '')}%`);
  if (req.query.genre) query = query.contains('genre', [req.query.genre]);
  const { data: movies, error } = await query;
  if (error) throw error;
  res.json({
    movies: (movies || []).map((m) => ({
      ...m,
      _id: m.id,
      durationMinutes: m.duration_minutes,
      posterUrl: m.poster_url,
      poster_url: m.poster_url
    }))
  });
});

export const getMovie = asyncHandler(async (req, res) => {
  const { data: movie, error } = await supabase.from('movies').select('*').eq('id', req.params.id).maybeSingle();
  if (error) throw error;
  if (!movie) return res.status(404).json({ message: 'Movie not found.' });
  res.json({
    movie: {
      ...movie,
      _id: movie.id,
      durationMinutes: movie.duration_minutes,
      posterUrl: movie.poster_url,
      poster_url: movie.poster_url
    }
  });
});

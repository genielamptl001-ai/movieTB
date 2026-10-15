import { supabase } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

export const createBooking = asyncHandler(async (req, res) => {
  const { showId, seats } = req.body;
  if (!showId || !Array.isArray(seats) || seats.length < 1) {
    return res.status(400).json({ message: 'Choose a show and at least one seat.' });
  }
  const normalizedSeats = [...new Set(seats.map(s => String(s).trim().toUpperCase()))];
  if (normalizedSeats.some(s => !/^[A-F](10|[1-9])$/.test(s))) {
    return res.status(400).json({ message: 'Seat format must be A1–F10.' });
  }
  const { data: show, error: showError } = await supabase.from('shows')
    .select('id,starts_at,price,movies(id,title,poster_url)')
    .eq('id', showId).maybeSingle();
  if (showError) throw showError;
  if (!show) return res.status(404).json({ message: 'Show not found.' });
  if (new Date(show.starts_at) <= new Date()) return res.status(400).json({ message: 'This show has already started.' });

  // Demo-level conflict check. For production, use a Postgres transaction/RPC with a unique seat constraint.
  const { data: existing, error: existingError } = await supabase.from('bookings')
    .select('seats').eq('show_id', showId).eq('status', 'confirmed');
  if (existingError) throw existingError;
  const taken = new Set((existing || []).flatMap(b => b.seats || []));
  if (normalizedSeats.some(seat => taken.has(seat))) {
    return res.status(409).json({ message: 'One or more selected seats are already booked.' });
  }
  const { data: booking, error } = await supabase.from('bookings').insert({
    user_id: req.user.id, show_id: showId, seats: normalizedSeats,
    total_amount: Number(show.price) * normalizedSeats.length
  }).select('id,user_id,show_id,seats,total_amount,status,created_at').single();
  if (error) throw error;
  res.status(201).json({ booking: {
    _id: booking.id, seats: booking.seats, totalAmount: Number(booking.total_amount),
    status: booking.status, show: {
      _id: show.id, startsAt: show.starts_at,
      movie: show.movies ? { _id: show.movies.id, title: show.movies.title, posterUrl: show.movies.poster_url } : null
    }
  }});
});

export const getMyBookings = asyncHandler(async (req, res) => {
  const { data, error } = await supabase.from('bookings')
    .select('id,seats,total_amount,status,created_at,shows(id,cinema,screen,starts_at,movies(id,title,poster_url))')
    .eq('user_id', req.user.id).order('created_at', { ascending: false });
  if (error) throw error;
  const bookings = (data || []).map(b => ({
    _id: b.id, seats: b.seats, totalAmount: Number(b.total_amount), status: b.status, createdAt: b.created_at,
    show: b.shows ? {
      _id: b.shows.id, cinema: b.shows.cinema, screen: b.shows.screen, startsAt: b.shows.starts_at,
      movie: b.shows.movies ? { _id: b.shows.movies.id, title: b.shows.movies.title, posterUrl: b.shows.movies.poster_url } : null
    } : null
  }));
  res.json({ bookings });
});

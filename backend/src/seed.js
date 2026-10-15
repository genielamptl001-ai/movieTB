import 'dotenv/config';
import { supabase, connectDB } from './config/db.js';

const movies = [
  {
    title: 'The Last Orbit',
    description: 'A crew on a distant space station races to save Earth after an unexpected signal appears.',
    genre: ['Sci-Fi', 'Adventure'], duration_minutes: 128, language: 'English', rating: 8.1,
    poster_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&w=800&q=80',
    featured: true
  },
  {
    title: 'City of Echoes',
    description: 'A detective follows a trail of secrets through a city that never sleeps.',
    genre: ['Thriller', 'Drama'], duration_minutes: 116, language: 'English', rating: 7.6,
    poster_url: 'https://images.unsplash.com/photo-1519608487953-e999c86e7455?auto=format&fit=crop&w=800&q=80'
  },
  {
    title: 'Monsoon Melody',
    description: 'Two musicians discover friendship and love while preparing for a life-changing concert.',
    genre: ['Romance', 'Drama'], duration_minutes: 132, language: 'Hindi', rating: 8.4,
    poster_url: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80'
  }
];

await connectDB();
const { error: deleteShowsError } = await supabase.from('shows').delete().gte('starts_at', '1970-01-01T00:00:00Z');
if (deleteShowsError) throw deleteShowsError;
const { error: deleteMoviesError } = await supabase.from('movies').delete().gte('created_at', '1970-01-01T00:00:00Z');
if (deleteMoviesError) throw deleteMoviesError;
const { data: created, error } = await supabase.from('movies').insert(movies).select('id');
if (error) throw error;

const shows = created.flatMap((movie, i) => [18, 21].map((hour, j) => {
  const startsAt = new Date();
  startsAt.setDate(startsAt.getDate() + 1 + j);
  startsAt.setHours(hour, 0, 0, 0);
  return {
    movie_id: movie.id,
    cinema: ['Downtown Cinema', 'Central Multiplex'][i % 2],
    screen: `Screen ${i + 1}`,
    starts_at: startsAt.toISOString(),
    price: 180 + i * 40,
    total_seats: 60
  };
}));
const { error: showError } = await supabase.from('shows').insert(shows);
if (showError) throw showError;
console.log('Supabase demo movies and shows inserted.');

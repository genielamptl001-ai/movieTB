import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import BookShow from './pages/BookShow';
import MyBookings from './pages/MyBookings';

function Footer() {
  return <footer className="border-t border-white/10 py-6 text-center text-xs text-slate-500">© {new Date().getFullYear()} ScreenTime · Made for movie lovers</footer>;
}

export default function App() {
  return <BrowserRouter><AuthProvider><div className="flex min-h-screen flex-col"><Navbar /><div className="flex-1"><Routes>
    <Route path="/" element={<Home />} />
    <Route path="/movies/:id" element={<MovieDetails />} />
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
    <Route path="/book/:showId" element={<ProtectedRoute><BookShow /></ProtectedRoute>} />
    <Route path="/bookings" element={<ProtectedRoute><MyBookings /></ProtectedRoute>} />
    <Route path="*" element={<main className="container-shell py-20 text-center"><h1 className="text-3xl font-black">Page not found</h1><a className="mt-4 inline-block text-rose-300" href="/">Go home</a></main>} />
  </Routes></div><Footer /></div></AuthProvider></BrowserRouter>;
}

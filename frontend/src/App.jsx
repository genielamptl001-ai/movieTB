import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import AdminRoute from './components/AdminRoute';
import Home from './pages/Home';
import MovieDetails from './pages/MovieDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import BookShow from './pages/BookShow';
import MyBookings from './pages/MyBookings';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function Footer() {
  return (
    <footer className="border-t border-white/10 py-8 text-center text-xs text-slate-500 font-medium">
      © {new Date().getFullYear()} <span className="font-bold text-slate-300">BOOKMYCINEMA</span> · The premier online movie ticket booking platform.
    </footer>
  );
}

// Layout for customer-facing pages
function CustomerLayout({ children }) {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-white">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Customer Routes with Customer Layout */}
          <Route path="/" element={<CustomerLayout><Home /></CustomerLayout>} />
          <Route path="/movies/:id" element={<CustomerLayout><MovieDetails /></CustomerLayout>} />
          <Route path="/login" element={<CustomerLayout><Login /></CustomerLayout>} />
          <Route path="/register" element={<CustomerLayout><Register /></CustomerLayout>} />
          <Route path="/book/:showId" element={<CustomerLayout><ProtectedRoute><BookShow /></ProtectedRoute></CustomerLayout>} />
          <Route path="/bookings" element={<CustomerLayout><ProtectedRoute><MyBookings /></ProtectedRoute></CustomerLayout>} />

          {/* Separate Dedicated Admin Portal */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* 404 Fallback */}
          <Route
            path="*"
            element={
              <CustomerLayout>
                <main className="container-shell py-20 text-center">
                  <h1 className="text-3xl font-black">Page not found</h1>
                  <a className="mt-4 inline-block text-rose-300 hover:underline" href="/">
                    Go home
                  </a>
                </main>
              </CustomerLayout>
            }
          />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

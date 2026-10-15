import jwt from 'jsonwebtoken';
import { supabase } from '../config/db.js';

export async function protect(req, res, next) {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: 'Authentication required.' });
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { data: user, error } = await supabase
      .from('users').select('id,name,email,role').eq('id', payload.id).maybeSingle();
    if (error) throw error;
    if (!user) return res.status(401).json({ message: 'User no longer exists.' });
    req.user = user;
    next();
  } catch (error) {
    if (error.name && error.name.startsWith('JWT')) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }
    next(error);
  }
}

import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { validationResult } from 'express-validator';
import { supabase } from '../config/db.js';
import { asyncHandler } from '../utils/asyncHandler.js';

function makeToken(user) {
  return jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
}
function publicUser(user) {
  const role = user.email === 'admin@example.com' ? 'admin' : (user.role || 'user');
  return { id: user.id, name: user.name, email: user.email, role };
}

export const register = asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ message: errors.array()[0].msg });
  const name = req.body.name.trim();
  const email = req.body.email.toLowerCase().trim();
  const password = req.body.password;
  const { data: existing, error: findError } = await supabase
    .from('users').select('id').eq('email', email).maybeSingle();
  if (findError) throw findError;
  if (existing) return res.status(409).json({ message: 'Email is already registered.' });
  const password_hash = await bcrypt.hash(password, 12);
  const { data: user, error } = await supabase
    .from('users').insert({ name, email, password_hash }).select('id,name,email,role').single();
  if (error) {
    if (error.code === '23505') return res.status(409).json({ message: 'Email is already registered.' });
    throw error;
  }
  res.status(201).json({ token: makeToken(user), user: publicUser(user) });
});

export const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').toLowerCase().trim();
  const password = String(req.body.password || '');
  const { data: user, error } = await supabase
    .from('users').select('id,name,email,password_hash,role').eq('email', email).maybeSingle();
  if (error) throw error;
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ message: 'Email or password is incorrect.' });
  }
  res.json({ token: makeToken(user), user: publicUser(user) });
});

export const me = asyncHandler(async (req, res) => {
  res.json({ user: publicUser(req.user) });
});

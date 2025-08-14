import { Router } from 'express';
import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { pool } from '../db.js';
import { authValidators } from '../utils/validators.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import dotenv from 'dotenv';
dotenv.config();

// Validate JWT_SECRET exists
if (!process.env.JWT_SECRET) {
  console.error('❌ JWT_SECRET is not defined in environment variables');
  console.error('Please add JWT_SECRET to your .env file');
  process.exit(1);
}

const router = Router();

// POST /api/auth/login
router.post('/login', authValidators.login, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
    const user = rows[0];
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    await pool.query('UPDATE users SET last_login_at = NOW() WHERE id = ?', [user.id]);

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d'
    });

    res.json({ token, user: { id: user.id, email: user.email, role: user.role, full_name: user.full_name } });
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register (public registration)
router.post('/register', authValidators.register, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, role = 'staff', full_name } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role, full_name) VALUES (?, ?, ?, ?)',
        [email, hash, role, full_name || null]
      );
      res.status(201).json({ id: result.insertId, email, role, full_name });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/auth/register-admin (admin only - for internal user management)
router.post('/register-admin', requireAuth, requireRole('admin'), authValidators.register, async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password, role = 'staff', full_name } = req.body;
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    try {
      const [result] = await pool.query(
        'INSERT INTO users (email, password_hash, role, full_name) VALUES (?, ?, ?, ?)',
        [email, hash, role, full_name || null]
      );
      res.status(201).json({ id: result.insertId, email, role, full_name });
    } catch (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ message: 'Email already exists' });
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

export default router;

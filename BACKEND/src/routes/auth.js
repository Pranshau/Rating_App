const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') }); 

const express = require('express');
const router = express.Router();
const db = require('../db'); // database connection
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require('../middleware/validators');

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) throw new Error('JWT_SECRET is not set in .env');

// Normal user sign up
router.post('/register', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: 'Name must be 4-60 characters' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!validateAddress(address)) return res.status(400).json({ error: 'Invalid address' });
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be 8-16 chars, one uppercase and one special character' });

    const existing = await db.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10));
    const result = await db.query(
      'INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role',
      [name.trim(), email.toLowerCase(), hashed, address || '', 'user']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Store owner sign up
router.post('/register-owner', async (req, res) => {
  try {
    const { name, email, address, password } = req.body;

    if (!validateName(name)) return res.status(400).json({ error: 'Name must be 4-60 characters' });
    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!validateAddress(address)) return res.status(400).json({ error: 'Invalid address' });
    if (!validatePassword(password)) return res.status(400).json({ error: 'Password must be 8-16 chars, one uppercase and one special character' });

    const existing = await db.query('SELECT id FROM users WHERE email=$1', [email.toLowerCase()]);
    if (existing.rows.length) return res.status(400).json({ error: 'Email already in use' });

    const hashed = await bcrypt.hash(password, parseInt(process.env.BCRYPT_SALT_ROUNDS || '10', 10));
    const result = await db.query(
      'INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,$5) RETURNING id,name,email,role',
      [name.trim(), email.toLowerCase(), hashed, address || '', 'owner']
    );

    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });

    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// Login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!validateEmail(email)) return res.status(400).json({ error: 'Invalid email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const result = await db.query('SELECT id,name,email,password,role FROM users WHERE email=$1', [email.toLowerCase()]);
    if (!result.rows.length) return res.status(400).json({ error: 'Invalid credentials' });

    const user = result.rows[0];
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ error: 'Invalid credentials' });

    const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;

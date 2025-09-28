const bcrypt = require('bcrypt');
const pool = require('../db'); 
require('dotenv').config();

async function seedAdmin() {
  try {
    const name = 'Admin';
    const email = 'admin@example.com';
    const password = 'Admin@123';
    const address = 'Admin HQ';
    const role = 'admin';

    // Check if admin already exists
    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (existing.rows.length > 0) {
      console.log('Admin user already exists');
      process.exit(0);
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '10');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Insert admin user
    const result = await pool.query(
      'INSERT INTO users (name, email, password, address, role, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id',
      [name, email, hashedPassword, address, role]
    );

    console.log(`Admin created successfully with ID: ${result.rows[0].id}`);
    process.exit(0);
  } catch (err) {
    console.error('Error creating admin:', err);
    process.exit(1);
  }
}

seedAdmin();

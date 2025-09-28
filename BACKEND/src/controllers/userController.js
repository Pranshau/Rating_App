import bcrypt from "bcryptjs";
import db from "../db.js";

export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const userId = req.user.id; // from JWT middleware

  if (!oldPassword || !newPassword) {
    return res.json({ success: false, error: 'Please provide old and new password.' });
  }

  if (newPassword.length < 6) {
    return res.json({ success: false, error: 'New password must be at least 6 characters.' });
  }

  try {
    const result = await db.query('SELECT password FROM users WHERE id = $1', [userId]);
    if (result.rows.length === 0) return res.json({ success: false, error: 'User not found.' });

    const user = result.rows[0];

    // Check old password
    const match = await bcrypt.compare(oldPassword, user.password);
    if (!match) return res.json({ success: false, error: 'Old password is incorrect.' });

    // Hash new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);

    return res.json({ success: true });
  } catch (err) {
    console.error(err);
    return res.json({ success: false, error: 'Server error.' });
  }
};

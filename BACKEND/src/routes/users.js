const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { authenticateToken } = require("../middleware/auth");
const { validatePassword } = require("../middleware/validators");

router.use(authenticateToken);

// Change password route
router.put("/password", async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;
    console.log(newPassword, "newPassword");

    console.log(validatePassword(newPassword), "validatePassword(newPassword)");
    if (!newPassword || !validatePassword(newPassword)) {
      return res.status(400).json({ error: "New password invalid" });
    }

    const userRes = await db.query("SELECT password FROM users WHERE id = $1", [
      userId,
    ]);
    if (!userRes.rows.length)
      return res.status(404).json({ error: "User not found" });

    const ok = await bcrypt.compare(oldPassword, userRes.rows[0].password);
    if (!ok) return res.status(400).json({ error: "Old password incorrect" });

    const hashed = await bcrypt.hash(
      newPassword,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
    );
    await db.query("UPDATE users SET password = $1 WHERE id = $2", [
      hashed,
      userId,
    ]);

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

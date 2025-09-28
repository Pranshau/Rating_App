const express = require("express");
const router = express.Router();
const db = require("../db");
const bcrypt = require("bcrypt");
const { authenticateToken } = require("../middleware/auth");
const { requireRole } = require("../middleware/roles");
const {
  validateName,
  validateAddress,
  validateEmail,
  validatePassword,
} = require("../middleware/validators");

router.use(authenticateToken);
router.use(requireRole("admin"));

// GET /api/admin/users
router.get("/users", async (req, res) => {
  try {
    const result = await db.query(`
     SELECT 
    u.id,
    u.name,
    u.email,
    u.role,
    u.address,
    s.address AS store_address,
    AVG(r.rating) AS average_rating
FROM users u
LEFT JOIN stores s ON s.owner_id = u.id
LEFT JOIN ratings r ON r.store_id = s.id
GROUP BY u.id, u.name, u.email, u.role, u.address, s.address
ORDER BY u.id;

    `);
    res.json({ users: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

router.get("/stores", async (req, res) => {
  try {
    const result = await db.query(`
      SELECT 
        s.id,
        s.name,
        u.email,
        s.address,
        u.id AS ownerId,
        u.name AS ownerName,
        COALESCE(r.avg_rating, 0):: numeric AS ownerRating
      FROM stores s
      LEFT JOIN users u ON s.owner_id = u.id
      LEFT JOIN (
        SELECT store_id, AVG(rating)::numeric AS avg_rating
        FROM ratings
        GROUP BY store_id
      ) r ON r.store_id = s.id
      ORDER BY s.id
    `);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add user (admin can create admin/user/owner)
router.post("/users", async (req, res) => {
  try {
    const { name, email, address, password, role } = req.body;
    if (!validateName(name))
      return res.status(400).json({ error: "Name must be 4-60 characters" });
    if (!validateEmail(email))
      return res.status(400).json({ error: "Invalid email" });
    if (!validateAddress(address))
      return res.status(400).json({ error: "Invalid address" });
    if (!validatePassword(password))
      return res
        .status(400)
        .json({
          error:
            "Password must be 8-16 chars with at least one uppercase and one special char",
        });
    const allowed = ["admin", "user", "owner"];
    if (!allowed.includes(role))
      return res.status(400).json({ error: "Invalid role" });

    const existing = await db.query("SELECT id FROM users WHERE email = $1", [
      email.toLowerCase(),
    ]);
    if (existing.rows.length)
      return res.status(400).json({ error: "Email exists" });

    const hashed = await bcrypt.hash(
      password,
      parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
    );
    const result = await db.query(
      "INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,$5) RETURNING id, name, email, role",
      [name.trim(), email.toLowerCase(), hashed, address || "", role]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Add store + owner
router.post("/stores", async (req, res) => {
  try {
    const { name, address, ownerName, ownerEmail, ownerPassword } = req.body;
    if (!name || typeof name !== "string")
      return res.status(400).json({ error: "Store name required" });
    if (!validateAddress(address))
      return res.status(400).json({ error: "Invalid store address" });

    let owner_id = null;

    if (ownerName && ownerEmail && ownerPassword) {
      // Validate owner
      if (!validateName(ownerName))
        return res.status(400).json({ error: "Owner name invalid" });
      if (!validateEmail(ownerEmail))
        return res.status(400).json({ error: "Owner email invalid" });
      if (!validatePassword(ownerPassword))
        return res.status(400).json({ error: "Owner password invalid" });

      // Check if owner exists
      const existingOwner = await db.query(
        "SELECT id FROM users WHERE email = $1",
        [ownerEmail.toLowerCase()]
      );
      if (existingOwner.rows.length)
        return res.status(400).json({ error: "Owner email already exists" });

      const hashed = await bcrypt.hash(
        ownerPassword,
        parseInt(process.env.BCRYPT_SALT_ROUNDS || "10")
      );
      const ownerRes = await db.query(
        "INSERT INTO users (name,email,password,address,role) VALUES ($1,$2,$3,$4,$5) RETURNING id",
        [ownerName.trim(), ownerEmail.toLowerCase(), hashed, "", "owner"]
      );
      owner_id = ownerRes.rows[0].id;
    }

    // Create store
    const result = await db.query(
      "INSERT INTO stores (name,address,owner_id) VALUES ($1,$2,$3) RETURNING *",
      [name.trim(), address, owner_id]
    );

    res.json({ store: result.rows[0], owner_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

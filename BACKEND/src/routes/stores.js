const express = require("express");
const router = express.Router();
const db = require("../db");
const { authenticateToken } = require("../middleware/auth");

router.get("/", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    let userId = null;
    if (authHeader) {
      const token = authHeader.split(" ")[1];
      try {
        const jwt = require("jsonwebtoken");
        const payload = jwt.verify(token, process.env.JWT_SECRET);
        userId = payload.id;
      } catch (e) {
        /* ignore */
      }
    }

    const { name, address, sortField = "id", sortOrder = "asc" } = req.query;
    const allowedSort = new Set(["id", "name", "address", "created_at"]);
    const order =
      (sortOrder && sortOrder.toLowerCase()) === "desc" ? "DESC" : "ASC";
    const sf = allowedSort.has(sortField) ? sortField : "id";

    const where = [];
    const params = [];
    let i = 1;
    if (name) {
      where.push(`s.name ILIKE $${i++}`);
      params.push(`%${name}%`);
    }
    if (address) {
      where.push(`s.address ILIKE $${i++}`);
      params.push(`%${address}%`);
    }

    // Get average rating
    let userRatingJoin = "";
    if (userId) {
      userRatingJoin = `LEFT JOIN (SELECT store_id, rating as user_rating FROM ratings WHERE user_id = $${i++}) ur ON ur.store_id = s.id`;
      params.push(userId);
    } else {
      userRatingJoin = `LEFT JOIN (SELECT 0 as store_id, 0 as user_rating) ur ON ur.store_id = s.id`; // dummy
    }

    const sql = `
      SELECT 
  s.id, s.name, s.address,
  u.name AS owner_name,
  COALESCE(avg_r.avg,0)::numeric AS overall_rating,
  ur.user_rating
FROM stores s
LEFT JOIN users u ON s.owner_id = u.id
LEFT JOIN (SELECT store_id, AVG(rating) AS avg FROM ratings GROUP BY store_id) avg_r ON avg_r.store_id = s.id
${userRatingJoin}
${where.length ? "WHERE " + where.join(" AND ") : ""}
ORDER BY ${sf} ${order}
LIMIT 200
    `;

    const result = await db.query(sql, params);
    res.json({ stores: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Change password
const bcrypt = require("bcrypt");
const { validatePassword } = require("../middleware/validators");

router.put("/password", authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { oldPassword, newPassword } = req.body;

    // Validate new password
    if (!newPassword || !validatePassword(newPassword)) {
      return res
        .status(400)
        .json({
          error:
            "New password invalid. Must be 8-16 chars, include uppercase and special char",
        });
    }

    // Get current hashed password
    const userRes = await db.query("SELECT password FROM users WHERE id = $1", [
      userId,
    ]);
    if (!userRes.rows.length)
      return res.status(404).json({ error: "User not found" });

    // Compare old password
    const match = await bcrypt.compare(oldPassword, userRes.rows[0].password);
    if (!match)
      return res.status(400).json({ error: "Old password incorrect" });

    // Hash new password and update
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

// Submit or update rating (protected)
router.post("/:id/rating", authenticateToken, async (req, res) => {
  try {
    const storeId = parseInt(req.params.id, 10);
    const userId = req.user.id;
    const { rating } = req.body;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Rating must be integer between 1 and 5" });
    }

    // Ensure store exists
    const s = await db.query("SELECT id FROM stores WHERE id = $1", [storeId]);
    if (!s.rows.length)
      return res.status(404).json({ error: "Store not found" });

    // Upsert: if a row exists, update; else insert
    const existing = await db.query(
      "SELECT id FROM ratings WHERE user_id = $1 AND store_id = $2",
      [userId, storeId]
    );
    if (existing.rows.length) {
      await db.query(
        "UPDATE ratings SET rating = $1, updated_at = NOW() WHERE user_id = $2 AND store_id = $3",
        [rating, userId, storeId]
      );
    } else {
      await db.query(
        "INSERT INTO ratings (user_id, store_id, rating) VALUES ($1,$2,$3)",
        [userId, storeId, rating]
      );
    }

    // return new average
    const avgRes = await db.query(
      "SELECT AVG(rating) AS avg FROM ratings WHERE store_id = $1",
      [storeId]
    );
    const avg = parseFloat(avgRes.rows[0].avg) || 0;
    res.json({ averageRating: avg });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();
const pool = require("../db"); 
const { authenticateToken } = require("../middleware/auth");

// Get all stores for logged-in owner
router.get("/stores", authenticateToken, async (req, res) => {
  try {
    const ownerId = req.user.id;

    // Get stores owned by this owner
    const storesResult = await pool.query(
      `SELECT id, name, address
       FROM stores
       WHERE owner_id = $1`,
      [ownerId]
    );

    const stores = storesResult.rows;

    // Get ratings for these stores
    const storeIds = stores.map((s) => s.id);
    let ratingsMap = {};
    if (storeIds.length > 0) {
      const ratingsResult = await pool.query(
        `SELECT store_id, COUNT(*) AS total_ratings, AVG(rating) AS average_rating
         FROM ratings
         WHERE store_id = ANY($1)
         GROUP BY store_id`,
        [storeIds]
      );

      ratingsResult.rows.forEach((r) => {
        ratingsMap[r.store_id] = {
          total_ratings: parseInt(r.total_ratings),
          average_rating: parseFloat(r.average_rating).toFixed(2),
        };
      });
    }

    // Merge ratings into stores
    const storesWithRatings = stores.map((s) => ({
      ...s,
      total_ratings: ratingsMap[s.id]?.total_ratings || 0,
      average_rating: ratingsMap[s.id]?.average_rating || "0.00",
    }));

    res.json(storesWithRatings);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch stores" });
  }
});

// Get all ratings for a store owned by this owner
router.get("/stores/:id/ratings", authenticateToken, async (req, res) => {
  try {
    const storeId = req.params.id;
    const ownerId = req.user.id;

    // Verify store belongs to owner
    const storeResult = await pool.query(
      "SELECT id FROM stores WHERE id = $1 AND owner_id = $2",
      [storeId, ownerId]
    );
    if (storeResult.rows.length === 0) {
      return res.status(403).json({ error: "Not authorized for this store" });
    }

    // Fetch ratings
    const ratingsResult = await pool.query(
      `SELECT r.rating, r.created_at, u.name, u.email
       FROM ratings r
       JOIN users u ON r.user_id = u.id
       WHERE r.store_id = $1
       ORDER BY r.created_at DESC`,
      [storeId]
    );

    res.json(ratingsResult.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch ratings" });
  }
});

module.exports = router;

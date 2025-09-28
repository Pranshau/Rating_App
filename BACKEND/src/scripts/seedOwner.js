const bcrypt = require("bcrypt");
const pool = require("../db");
require("dotenv").config();

async function seedOwner() {
  try {
    const ownerName = "Owner";
    const ownerEmail = "owner@example.com";
    const ownerPassword = "Owner@123";
    const ownerAddress = "Owner HQ";
    const storeName = "Owner Store";
    const storeEmail = "store@example.com";
    const storeAddress = "123 Main Street";

    // Check if owner already exists
    const existingOwner = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [ownerEmail]
    );
    let ownerId;

    if (existingOwner.rows.length > 0) {
      console.log("Owner already exists");
      ownerId = existingOwner.rows[0].id;
    } else {
      // Hash owner password
      const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || "10");
      const hashedPassword = await bcrypt.hash(ownerPassword, saltRounds);

      // Insert owner
      const ownerResult = await pool.query(
        "INSERT INTO users (name, email, password, address, role, created_at) VALUES ($1,$2,$3,$4,$5,NOW()) RETURNING id",
        [ownerName, ownerEmail, hashedPassword, ownerAddress, "owner"]
      );
      ownerId = ownerResult.rows[0].id;
      console.log(`Owner created with ID: ${ownerId}`);
    }

    // Check if store already exists
    const existingStore = await pool.query(
      "SELECT id FROM stores WHERE owner_id = $1",
      [ownerId]
    );
    if (existingStore.rows.length > 0) {
      console.log("Store for owner already exists");
    } else {
      // Insert store
      const storeResult = await pool.query(
        "INSERT INTO stores (name, email, address, owner_id, created_at) VALUES ($1,$2,$3,$4,NOW()) RETURNING id",
        [storeName, storeEmail, storeAddress, ownerId]
      );
      console.log(`Store created with ID: ${storeResult.rows[0].id}`);
    }

    process.exit(0);
  } catch (err) {
    console.error("Error seeding owner and store:", err);
    process.exit(1);
  }
}

seedOwner();

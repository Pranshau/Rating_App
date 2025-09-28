import bcrypt from "bcryptjs";
import db from "../db.js";

// Admin adds store + owner
export const addStoreWithOwner = async (req, res) => {
  const { name, email, address, owner } = req.body;

  if (!name || !address || !owner?.email || !owner?.password || !owner?.name) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    //Check if owner already exists
    let ownerId;
    const existingOwner = await db("users").where({ email: owner.email.toLowerCase() }).first();

    if (existingOwner) {
      ownerId = existingOwner.id;
    } else {
      
      const hashedPassword = await bcrypt.hash(owner.password, 10);

      // Insert owner into users table
      const [newOwner] = await db("users")
        .insert({
          name: owner.name,
          email: owner.email.toLowerCase(),
          password: hashedPassword,
          address: address || "",
          role: "owner",
        })
        .returning("*");

      ownerId = newOwner.id;
    }

    // Insert store
    const [store] = await db("stores")
      .insert({
        name,
        email: email || null,
        address,
        owner_id: ownerId,
      })
      .returning("*");

    // Return store
    res.json({
      message: "Store & Owner added successfully",
      store: {
        ...store,
        ownerName: owner.name,
        ownerId: ownerId,
        ownerRating: 0
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to add store & owner" });
  }
};

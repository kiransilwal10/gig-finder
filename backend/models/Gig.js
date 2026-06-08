const db = require("../config/db-config.js");

async function createGig({
  sellerId,
  title,
  description,
  category,
  location,
  priceCents,
  currency,
  imageUrl,
}) {
  return await db.one(
    `INSERT INTO gigs (seller_id, title, description, category, location, price_cents, currency, image_url)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING *`,
    [
      sellerId,
      title,
      description || null,
      category || null,
      location || null,
      priceCents,
      currency || "usd",
      imageUrl || null,
    ]
  );
}

async function listGigs({ category, location, maxPrice } = {}) {
  const conditions = ["g.is_active = true", "u.stripe_charges_enabled = true"];
  const values = [];

  if (category) {
    values.push(category);
    conditions.push(`g.category = $${values.length}`);
  }
  if (location) {
    values.push(location);
    conditions.push(`g.location = $${values.length}`);
  }
  if (maxPrice) {
    values.push(maxPrice);
    conditions.push(`g.price_cents <= $${values.length}`);
  }

  return await db.any(
    `SELECT g.*, u.first_name, u.last_name
     FROM gigs g
     JOIN users u ON u.id = g.seller_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY g.created_at DESC`,
    values
  );
}

async function getGigById({ id }) {
  return await db.oneOrNone(
    `SELECT g.*, u.first_name, u.last_name, u.stripe_account_id, u.stripe_charges_enabled
     FROM gigs g
     JOIN users u ON u.id = g.seller_id
     WHERE g.id = $1`,
    [id]
  );
}

async function listGigsBySeller({ sellerId }) {
  return await db.any(
    "SELECT * FROM gigs WHERE seller_id = $1 ORDER BY created_at DESC",
    [sellerId]
  );
}

async function deactivateGig({ id, sellerId }) {
  return await db.result(
    "UPDATE gigs SET is_active = false WHERE id = $1 AND seller_id = $2",
    [id, sellerId],
    (r) => r.rowCount
  );
}

module.exports = {
  createGig,
  listGigs,
  getGigById,
  listGigsBySeller,
  deactivateGig,
};

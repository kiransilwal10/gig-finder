const db = require("../config/db-config.js");

async function createPendingOrder({
  gigId,
  buyerId,
  sellerId,
  amountCents,
  applicationFeeCents,
  currency,
  checkoutSessionId,
}) {
  return await db.one(
    `INSERT INTO orders (gig_id, buyer_id, seller_id, amount_cents, application_fee_cents, currency, stripe_checkout_session_id, status)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending')
     RETURNING *`,
    [
      gigId,
      buyerId,
      sellerId,
      amountCents,
      applicationFeeCents,
      currency || "usd",
      checkoutSessionId,
    ]
  );
}

async function markPaidBySession({ checkoutSessionId, paymentIntentId }) {
  return await db.oneOrNone(
    `UPDATE orders
     SET status = 'paid', stripe_payment_intent_id = $2, paid_at = now()
     WHERE stripe_checkout_session_id = $1 AND status = 'pending'
     RETURNING *`,
    [checkoutSessionId, paymentIntentId]
  );
}

async function markRefundedByPaymentIntent({ paymentIntentId }) {
  return await db.oneOrNone(
    `UPDATE orders
     SET status = 'refunded'
     WHERE stripe_payment_intent_id = $1 AND status = 'paid'
     RETURNING *`,
    [paymentIntentId]
  );
}

async function listOrdersByBuyer({ buyerId }) {
  return await db.any(
    `SELECT o.*, g.title
     FROM orders o
     JOIN gigs g ON g.id = o.gig_id
     WHERE o.buyer_id = $1
     ORDER BY o.created_at DESC`,
    [buyerId]
  );
}

async function listSalesBySeller({ sellerId }) {
  return await db.any(
    `SELECT o.*, g.title
     FROM orders o
     JOIN gigs g ON g.id = o.gig_id
     WHERE o.seller_id = $1
     ORDER BY o.created_at DESC`,
    [sellerId]
  );
}

async function sellerEarnings({ sellerId }) {
  return await db.one(
    `SELECT
       COUNT(*)::int AS paid_count,
       COALESCE(SUM(amount_cents), 0)::int AS gross_cents,
       COALESCE(SUM(application_fee_cents), 0)::int AS fees_cents,
       COALESCE(SUM(amount_cents - application_fee_cents), 0)::int AS net_cents
     FROM orders
     WHERE seller_id = $1 AND status = 'paid'`,
    [sellerId]
  );
}

module.exports = {
  createPendingOrder,
  markPaidBySession,
  markRefundedByPaymentIntent,
  listOrdersByBuyer,
  listSalesBySeller,
  sellerEarnings,
};

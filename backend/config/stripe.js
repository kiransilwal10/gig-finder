const Stripe = require("stripe");
const { applicationFeeCents, sellerNetCents } = require("../utils/fees");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PLATFORM_FEE_PERCENT = parseInt(process.env.PLATFORM_FEE_PERCENT, 10) || 10;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://app.localhost.com:3000";

const platformFee = (amountCents) =>
  applicationFeeCents(amountCents, PLATFORM_FEE_PERCENT);

const sellerNet = (amountCents) => sellerNetCents(amountCents, PLATFORM_FEE_PERCENT);

module.exports = {
  stripe,
  PLATFORM_FEE_PERCENT,
  FRONTEND_URL,
  platformFee,
  sellerNet,
};

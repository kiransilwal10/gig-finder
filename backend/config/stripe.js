const Stripe = require("stripe");
const { applicationFeeCents, sellerNetCents } = require("../utils/fees");

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const PLATFORM_FEE_PERCENT = parseInt(process.env.PLATFORM_FEE_PERCENT, 10) || 10;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://app.localhost.com:3000";

const platformFee = (amountCents) =>
  applicationFeeCents(amountCents, PLATFORM_FEE_PERCENT);

const sellerNet = (amountCents) => sellerNetCents(amountCents, PLATFORM_FEE_PERCENT);

function toAppError(error) {
  if (error && typeof error.type === "string" && error.type.startsWith("Stripe")) {
    return { msg: error.message, status: error.statusCode || 400 };
  }
  return error;
}

module.exports = {
  stripe,
  PLATFORM_FEE_PERCENT,
  FRONTEND_URL,
  platformFee,
  sellerNet,
  toAppError,
};

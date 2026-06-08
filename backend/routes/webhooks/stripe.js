const express = require("express");
const { stripe } = require("../../config/stripe");
const userModel = require("../../models/User");
const orderModel = require("../../models/Order");

const router = express.Router();

const WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

router.post("/", async (req, res) => {
  const signature = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, signature, WEBHOOK_SECRET);
  } catch (err) {
    console.log("Webhook signature verification failed:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleEvent(event);
  } catch (err) {
    console.log("Webhook handler error:", err);
    return res.status(500).json({ received: false });
  }

  res.json({ received: true });
});

async function handleEvent(event) {
  switch (event.type) {
    case "account.updated": {
      const account = event.data.object;
      await userModel.updateStripeStatus({
        stripeAccountId: account.id,
        chargesEnabled: account.charges_enabled,
        payoutsEnabled: account.payouts_enabled,
        detailsSubmitted: account.details_submitted,
      });
      break;
    }

    case "checkout.session.completed": {
      const session = event.data.object;
      await orderModel.markPaidBySession({
        checkoutSessionId: session.id,
        paymentIntentId: session.payment_intent,
      });
      break;
    }

    case "charge.refunded": {
      const charge = event.data.object;
      if (charge.payment_intent) {
        await orderModel.markRefundedByPaymentIntent({
          paymentIntentId: charge.payment_intent,
        });
      }
      break;
    }

    default:
      break;
  }
}

module.exports = router;

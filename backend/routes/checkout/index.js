const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const gigModel = require("../../models/Gig");
const orderModel = require("../../models/Order");
const {
  stripe,
  FRONTEND_URL,
  platformFee,
  toAppError,
} = require("../../config/stripe");

const router = express.Router();

router.post("/:gigId", verifyToken, async (req, res, next) => {
  try {
    const buyerId = req.user.userId;
    const gig = await gigModel.getGigById({ id: req.params.gigId });

    if (!gig || !gig.is_active) {
      throw { msg: "Gig not found", status: 404 };
    }
    if (gig.seller_id === buyerId) {
      throw { msg: "You cannot buy your own gig", status: 400 };
    }
    if (!gig.stripe_charges_enabled || !gig.stripe_account_id) {
      throw { msg: "This seller cannot accept payments yet", status: 400 };
    }

    const amountCents = gig.price_cents;
    const feeCents = platformFee(amountCents);

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [
        {
          price_data: {
            currency: gig.currency,
            product_data: { name: gig.title },
            unit_amount: amountCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: feeCents,
        transfer_data: { destination: gig.stripe_account_id },
      },
      success_url: `${FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${FRONTEND_URL}/checkout/cancel`,
      metadata: {
        gig_id: String(gig.id),
        buyer_id: String(buyerId),
        seller_id: String(gig.seller_id),
      },
    });

    await orderModel.createPendingOrder({
      gigId: gig.id,
      buyerId,
      sellerId: gig.seller_id,
      amountCents,
      applicationFeeCents: feeCents,
      currency: gig.currency,
      checkoutSessionId: session.id,
    });

    res.json({ url: session.url });
  } catch (error) {
    next(toAppError(error));
  }
});

module.exports = router;

const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const userModel = require("../../models/User");
const { stripe, FRONTEND_URL, toAppError } = require("../../config/stripe");

const router = express.Router();

router.post("/onboard", verifyToken, async (req, res, next) => {
  try {
    const user = await userModel.findByID({ id: req.user.userId });
    if (!user) {
      throw { msg: "Account not found", status: 404 };
    }

    let accountId = user.stripe_account_id;
    if (!accountId) {
      const account = await stripe.accounts.create({
        type: "express",
        email: user.email,
        business_type: "individual",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        metadata: { user_id: String(user.id) },
      });
      accountId = account.id;
      await userModel.setStripeAccountId({
        id: user.id,
        stripeAccountId: accountId,
      });
    }

    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${FRONTEND_URL}/sell/onboard?refresh=1`,
      return_url: `${FRONTEND_URL}/sell/onboard?complete=1`,
      type: "account_onboarding",
    });

    res.json({ url: accountLink.url });
  } catch (error) {
    next(toAppError(error));
  }
});

router.get("/status", verifyToken, async (req, res, next) => {
  try {
    const user = await userModel.findByID({ id: req.user.userId });
    if (!user) {
      throw { msg: "Account not found", status: 404 };
    }

    if (!user.stripe_account_id) {
      return res.json({
        onboarded: false,
        charges_enabled: false,
        payouts_enabled: false,
        details_submitted: false,
      });
    }

    const account = await stripe.accounts.retrieve(user.stripe_account_id);
    await userModel.updateStripeStatus({
      stripeAccountId: account.id,
      chargesEnabled: account.charges_enabled,
      payoutsEnabled: account.payouts_enabled,
      detailsSubmitted: account.details_submitted,
    });

    res.json({
      onboarded: account.details_submitted,
      charges_enabled: account.charges_enabled,
      payouts_enabled: account.payouts_enabled,
      details_submitted: account.details_submitted,
    });
  } catch (error) {
    next(toAppError(error));
  }
});

router.post("/dashboard-link", verifyToken, async (req, res, next) => {
  try {
    const user = await userModel.findByID({ id: req.user.userId });
    if (!user?.stripe_account_id) {
      throw { msg: "You have not started seller onboarding yet", status: 400 };
    }

    const link = await stripe.accounts.createLoginLink(user.stripe_account_id);
    res.json({ url: link.url });
  } catch (error) {
    next(toAppError(error));
  }
});

module.exports = router;

const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const userModel = require("../../models/User");
const gigModel = require("../../models/Gig");

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const { category, location, maxPrice } = req.query;
    const filters = {};

    if (category) filters.category = category;
    if (location) filters.location = location;
    if (maxPrice) {
      const cents = Math.round(parseFloat(maxPrice) * 100);
      if (Number.isFinite(cents)) filters.maxPrice = cents;
    }

    const gigs = await gigModel.listGigs(filters);
    res.json({ gigs });
  } catch (error) {
    next(error);
  }
});

router.get("/:id", async (req, res, next) => {
  try {
    const gig = await gigModel.getGigById({ id: req.params.id });
    if (!gig || !gig.is_active) {
      throw { msg: "Gig not found", status: 404 };
    }

    delete gig.stripe_account_id;
    res.json({ gig });
  } catch (error) {
    next(error);
  }
});

router.post("/", verifyToken, async (req, res, next) => {
  try {
    const user = await userModel.findByID({ id: req.user.userId });
    if (!user) {
      throw { msg: "Account not found", status: 404 };
    }
    if (!user.stripe_charges_enabled) {
      throw { msg: "Finish seller onboarding before listing a gig", status: 403 };
    }

    const { title, description, category, location, price } = req.body;

    if (!title || title.trim().length < 3) {
      throw { msg: "Please enter a gig title", status: 400 };
    }

    const priceCents = Math.round(parseFloat(price) * 100);
    if (!Number.isFinite(priceCents) || priceCents <= 0) {
      throw { msg: "Please enter a valid price", status: 400 };
    }

    const gig = await gigModel.createGig({
      sellerId: user.id,
      title: title.trim(),
      description,
      category,
      location,
      priceCents,
    });

    res.status(201).json({ gig });
  } catch (error) {
    next(error);
  }
});

router.delete("/:id", verifyToken, async (req, res, next) => {
  try {
    const removed = await gigModel.deactivateGig({
      id: req.params.id,
      sellerId: req.user.userId,
    });
    if (!removed) {
      throw { msg: "Gig not found", status: 404 };
    }
    res.json({ message: "Gig removed" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

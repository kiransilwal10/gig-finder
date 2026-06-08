const express = require("express");
const verifyToken = require("../../utils/verifyToken");
const orderModel = require("../../models/Order");

const router = express.Router();

router.get("/mine", verifyToken, async (req, res, next) => {
  try {
    const orders = await orderModel.listOrdersByBuyer({
      buyerId: req.user.userId,
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/sales", verifyToken, async (req, res, next) => {
  try {
    const orders = await orderModel.listSalesBySeller({
      sellerId: req.user.userId,
    });
    res.json({ orders });
  } catch (error) {
    next(error);
  }
});

router.get("/earnings", verifyToken, async (req, res, next) => {
  try {
    const earnings = await orderModel.sellerEarnings({
      sellerId: req.user.userId,
    });
    res.json({ earnings });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

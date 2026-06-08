const express = require("express");
const loginRouter = require("./auth/login.js");
const verifyRouter = require("./auth/verify");
//const logoutRouter = require("./logout");
const registerRouter = require("./auth/register.js")
const connectRouter = require("./connect")

const router = express.Router();

router.use("/register", registerRouter)
router.use("/login", loginRouter);
router.use("/verify", verifyRouter);
router.use("/connect", connectRouter);
//router.use("/logout", logoutRouter);

module.exports = router;

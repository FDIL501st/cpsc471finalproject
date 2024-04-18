// login.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.post("/", async function (req, res, next) {
  try {
    const { email, password } = req.body;

    const loginResult = await bridge.loginUser({
      email,
      password,
    });

    res.json(loginResult);
  } catch (err) {
    console.error("Error during user login", err.message);
    next(err);
  }
});

module.exports = router;

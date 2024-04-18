// register.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.post("/", async function (req, res, next) {
  try {
    const {
      email,
      password,
      first_name,
      last_name,
      company_name,
      mailing_address,
      phone_number,
    } = req.body;

    const registrationResult = await bridge.registerUser({
      email,
      password,
      first_name,
      last_name,
      company_name,
      mailing_address,
      phone_number,
    });

    res.json(registrationResult);
  } catch (err) {
    console.error("Error during user registration", err.message);
    next(err);
  }
});

module.exports = router;

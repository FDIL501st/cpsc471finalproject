// updateUser.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

// updates email
router.patch("/email", async function (req, res, next) {
  try {
    const { user_id, email } = req.body;

    const emailUpdateResult = await bridge.updateUserEmail(user_id, email);

    res.json(emailUpdateResult);
  } catch (err) {
    console.error("Error in updating user email:", err.message);
    next(err);
  }
});

// updates password
router.patch("/password", async function (req, res, next) {
  try {
    const { user_id, password } = req.body;

    const passwordUpdateResult = await bridge.updateUserPassword(
      user_id,
      password
    );

    res.json(passwordUpdateResult);
  } catch (err) {
    console.error("Error in updating user password:", err.message);
    next(err);
  }
});

module.exports = router;

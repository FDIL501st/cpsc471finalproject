// deleteuser.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

// updates email
router.delete("/", async function (req, res, next) {
  try {
    const { user_id } = req.body;

    const emailUpdateResult = await bridge.deleteUser(user_id);

    res.json(emailUpdateResult);
  } catch (err) {
    console.error("Error in updating user email:", err.message);
    next(err);
  }
});

module.exports = router;

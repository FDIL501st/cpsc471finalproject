// checkPassword.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

// Confirm old password
router.post("/", async function (req, res, next) {
  try {
    const { user_id, password } = req.body;

    //console.log("in POST, user_id", user_id);
    //console.log("in POST, password:", password);

    // Check if the old password matches the stored password in bridge
    const passwordMatch = await bridge.checkPassword(user_id, password);

    // If passwords match, set match to true
    if (passwordMatch) {
      res.json({ match: true, message: "Old password is correct" });
    } else {
      // If passwords do not match, return server error
      res
        .status(401)
        .json({ match: false, message: "Old password is incorrect" });
    }
  } catch (err) {
    // Catch any other error
    console.error("Error in checking old password:", err.message);
    next(err);
  }
});

module.exports = router;

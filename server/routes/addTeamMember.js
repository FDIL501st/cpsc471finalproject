const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.post("/", async (req, res, next) => {
  try {
    const teamMemberData = req.body;

    const addTeamMemberResult = await bridge.addTeamMember(teamMemberData);

    if (addTeamMemberResult.success) {
      res.status(201).json({ message: "Team member added successfully" });
    } else {
      res.status(500).json({ message: "Error adding team member" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

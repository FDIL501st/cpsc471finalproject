const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.get("/", async (req, res, next) => {
  try {
    // Assuming you want to list team members for a specific company
    const companyId = req.query.companyId; // You can adjust this based on your requirement

    const teamMembersResult = await bridge.listTeamMembers(companyId);

    if (teamMembersResult.success) {
      res.status(200).json(teamMembersResult.data);
    } else {
      res.status(500).json({ message: "Error listing team members" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

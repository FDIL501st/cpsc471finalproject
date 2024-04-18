const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.delete("/:teamMemberId", async (req, res, next) => {
  try {
    const teamMemberId = req.params.teamMemberId;

    const deleteTeamMemberResult = await bridge.deleteTeamMember(teamMemberId);

    if (deleteTeamMemberResult.success) {
      res.status(200).json({ message: "Team member deleted successfully" });
    } else {
      res.status(500).json({ message: "Error deleting team member" });
    }
  } catch (error) {
    next(error);
  }
});

module.exports = router;

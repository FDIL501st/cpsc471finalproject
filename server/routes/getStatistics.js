// getStatistics.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.get("/:company_id", async function (req, res, next) {
  try {
    const company_id = req.params.company_id;

    const statisticsResult = await bridge.getStatistics(company_id);

    res.json(statisticsResult);
  } catch (err) {
    console.error("Error getting statistics of a company:", err.message);
    next(err);
  }
});

module.exports = router;

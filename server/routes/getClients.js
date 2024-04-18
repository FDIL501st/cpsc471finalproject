// getClients.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.get("/:company_id", async function (req, res, next) {
  try {
    const company_id = req.params.company_id;

    const clientsResult = await bridge.getClients(company_id);

    res.json(clientsResult);
  } catch (err) {
    console.error("Error getting all clients of a company:", err.message);
    next(err);
  }
});

module.exports = router;

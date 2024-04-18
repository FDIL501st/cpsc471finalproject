// listInvoices.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.get("/:created_by_company", async function (req, res, next) {
  try {
    const { created_by_company } = req.params;

    const invoicesResult = await bridge.listInvoices(created_by_company);

    res.json(invoicesResult);
  } catch (err) {
    console.error("Error listing invoices:", err.message);
    next(err);
  }
});

module.exports = router;

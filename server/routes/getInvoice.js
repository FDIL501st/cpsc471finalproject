// getInvoice.js
const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.get("/:invoice_id", async (req, res, next) => {
  try {
    const invoice_id = req.params.invoice_id;

    const invoiceData = await bridge.getInvoice(invoice_id);

    res.json(invoiceData);
  } catch (err) {
    console.error("Error fetching invoice data", err.message);
    next(err);
  }
});

module.exports = router;

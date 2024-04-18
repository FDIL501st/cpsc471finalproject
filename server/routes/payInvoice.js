// payInvoice.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.put("/:invoice_id", async function (req, res, next) {
  try {
    const invoiceId = req.params.invoice_id;

    const paymentResult = await bridge.payInvoice(invoiceId);

    res.json(paymentResult);
  } catch (err) {
    console.error("Error during invoice payment", err.message);
    next(err);
  }
});

module.exports = router;

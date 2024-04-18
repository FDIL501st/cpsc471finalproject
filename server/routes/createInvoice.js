// invoice.js

const express = require("express");
const router = express.Router();
const bridge = require("../services/bridge");

router.post("/", async function (req, res, next) {
  try {
    const invoiceData = req.body.invoice;
    const servicesData = req.body.services;
    const clientData = req.body.client;

    const invoiceResult = await bridge.createInvoice({
      invoiceData,
      servicesData,
      clientData,
    });

    res.json(invoiceResult);
  } catch (err) {
    console.error("Error during invoice creation", err.message);
    next(err);
  }
});

module.exports = router;

const express = require("express");
const router = express.Router();

const Customer = require("../models/Customer");
const Payment = require("../models/Payment");

router.post("/seed", async (req, res) => {
    try {
        const customer = await Customer.create({
            name: "Priya Mehta",
            email: "priya@example.com",
            totalPayments: 12,
            successfulPayments: 10,
            failedPayments: 2,
            lifetimeValue: 75000
        });

        const payment = await Payment.create({
            customer: customer._id,
            amount: 12000,
            status: "failed",
            failureReason: "insufficient_funds"
        });

        res.status(201).json({
            message: "Seed successful",
            customer,
            payment
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
});

module.exports = router;
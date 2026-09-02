const express = require("express");

const {
    analyzePayment,
    getOpportunities,
    getRecoveryMetrics,
    executeRecovery
} = require("../controllers/recoveryController");

const router = express.Router();

router.post("/analyze/:paymentId", analyzePayment);

router.post("/execute/:opportunityId", executeRecovery);

router.get("/metrics", getRecoveryMetrics);

router.get("/", getOpportunities);

module.exports = router;
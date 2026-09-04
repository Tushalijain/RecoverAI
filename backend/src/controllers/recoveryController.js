const Payment = require("../models/Payment");
const Customer = require("../models/Customer");
const RecoveryOpportunity = require("../models/RecoveryOpportunity");
const { evaluateRecoveryAction } = require("../services/policyEngine");

const { analyzeFailedPayment } = require("../services/recoveryEngine");

const analyzePayment = async (req, res) => {
    try {
        const { paymentId } = req.params;

        const payment = await Payment.findById(paymentId);

        if (!payment) {
            return res.status(404).json({
                message: "Payment not found"
            });
        }

        if (payment.status !== "failed") {
            return res.status(400).json({
                message: "Only failed payments can be analyzed"
            });
        }

        const customer = await Customer.findById(payment.customer);

        if (!customer) {
            return res.status(404).json({
                message: "Customer not found"
            });
        }

        const opportunity = await analyzeFailedPayment(
            payment,
            customer
        );

        res.status(201).json({
            message: "Recovery opportunity created",
            opportunity
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getOpportunities = async (req, res) => {
    try {
        const opportunities = await RecoveryOpportunity.find()
            .populate("customer")
            .populate("payment")
            .sort({ recoveryProbability: -1 });

        res.status(200).json(opportunities);

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const getRecoveryMetrics = async (req, res) => {
    try {
        const opportunities = await RecoveryOpportunity.find();

        const revenueAtRisk = opportunities.reduce(
            (sum, opportunity) => sum + opportunity.amount,
            0
        );

        const recoverableRevenue = opportunities.reduce(
            (sum, opportunity) => {
                const expectedRecovery =
                    opportunity.amount *
                    (opportunity.recoveryProbability / 100);

                return sum + expectedRecovery;
            },
            0
        );

        const recoveredRevenue = opportunities
            .filter((opportunity) => opportunity.status === "RECOVERED")
            .reduce(
                (sum, opportunity) => sum + opportunity.amount,
                0
            );

        const recoveryRate =
            revenueAtRisk > 0
                ? (recoveredRevenue / revenueAtRisk) * 100
                : 0;

        res.status(200).json({
            revenueAtRisk: Math.round(revenueAtRisk),
            recoverableRevenue: Math.round(recoverableRevenue),
            recoveredRevenue: Math.round(recoveredRevenue),
            recoveryRate: Number(recoveryRate.toFixed(2)),
            totalOpportunities: opportunities.length
        });

    } catch (error) {
        res.status(500).json({
            message: error.message
        });
    }
};

const executeRecovery = async (req, res) => {
  try {
    const opportunity = await RecoveryOpportunity.findById(
      req.params.opportunityId
    );

    if (!opportunity) {
      return res.status(404).json({
        message: "Recovery opportunity not found"
      });
    }

    if (opportunity.status === "RECOVERED") {
      return res.status(400).json({
        message: "Revenue already recovered"
      });
    }

    const policyDecision =
      evaluateRecoveryAction(opportunity);

    // Policy blocked AI action
    if (!policyDecision.allowed) {
      opportunity.recommendedAction =
        policyDecision.finalAction;

      opportunity.status = "EXECUTED";

      await opportunity.save();

      return res.status(200).json({
        message:
          "AI action blocked and safe fallback executed",
        executedAction: policyDecision.finalAction,
        policyDecision,
        recoveredAmount: 0,
        opportunity
      });
    }

    // Allowed action
    let actionMessage = "";

    if (policyDecision.finalAction === "RETRY_PAYMENT") {
      opportunity.status = "RECOVERED";

      actionMessage =
        "Payment retry simulated successfully. Revenue recovered.";
    }

    else if (
      policyDecision.finalAction === "SEND_REMINDER"
    ) {
      opportunity.status = "EXECUTED";

      actionMessage =
        "Recovery reminder sent to customer.";
    }

    else if (
      policyDecision.finalAction === "ESCALATE"
    ) {
      opportunity.status = "EXECUTED";

      actionMessage =
        "Opportunity escalated for manual review.";
    }

    else {
      opportunity.status = "EXECUTED";

      actionMessage =
        "No recovery action required.";
    }

    await opportunity.save();

    return res.status(200).json({
      message: actionMessage,
      executedAction: policyDecision.finalAction,
      policyDecision,
      recoveredAmount:
        opportunity.status === "RECOVERED"
          ? opportunity.amount
          : 0,
      opportunity
    });

  } catch (error) {
    console.error(
      "Recovery execution failed:",
      error.message
    );

    return res.status(500).json({
      message: "Recovery execution failed"
    });
  }
};

module.exports = {
    analyzePayment,
    getOpportunities,
    getRecoveryMetrics,
    executeRecovery
};
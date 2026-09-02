const RecoveryOpportunity = require("../models/RecoveryOpportunity");
const { analyzeRecoveryOpportunity } = require("./aiService");

const VALID_PRIORITIES = ["LOW", "MEDIUM", "HIGH"];

const VALID_ACTIONS = [
    "RETRY_PAYMENT",
    "SEND_REMINDER",
    "ESCALATE",
    "NO_ACTION"
];

const getFallbackAnalysis = (payment, customer) => {
    let recoveryProbability = 40;
    let priority = "LOW";
    let recommendedAction = "SEND_REMINDER";

    if (customer.successfulPayments >= 5) {
        recoveryProbability += 30;
    }

    if (customer.lifetimeValue >= 20000) {
        recoveryProbability += 15;
    }

    if (customer.failedPayments <= 2) {
        recoveryProbability += 10;
    }

    recoveryProbability = Math.min(recoveryProbability, 100);

    if (recoveryProbability >= 80) {
        priority = "HIGH";
        recommendedAction = "RETRY_PAYMENT";
    } else if (recoveryProbability >= 60) {
        priority = "MEDIUM";
        recommendedAction = "SEND_REMINDER";
    }

    return {
        recoveryProbability,
        priority,
        reason: "Fallback rule-based recovery analysis used.",
        recommendedAction
    };
};

const isValidAIAnalysis = (analysis) => {
    if (!analysis) return false;

    if (
        !Number.isInteger(analysis.recoveryProbability) ||
        analysis.recoveryProbability < 0 ||
        analysis.recoveryProbability > 100
    ) {
        return false;
    }

    if (!VALID_PRIORITIES.includes(analysis.priority)) {
        return false;
    }

    if (!VALID_ACTIONS.includes(analysis.recommendedAction)) {
        return false;
    }

    if (
        typeof analysis.reason !== "string" ||
        analysis.reason.trim() === ""
    ) {
        return false;
    }

    return true;
};

const analyzeFailedPayment = async (payment, customer) => {

    const existingOpportunity =
        await RecoveryOpportunity.findOne({
            payment: payment._id
        });

    if (existingOpportunity) {
        return existingOpportunity;
    }

    let analysis;

    try {
        const aiAnalysis =
            await analyzeRecoveryOpportunity(payment, customer);

        if (isValidAIAnalysis(aiAnalysis)) {
            analysis = aiAnalysis;
        } else {
            console.log("Invalid AI response. Using fallback.");
            analysis = getFallbackAnalysis(payment, customer);
        }

    } catch (error) {
        console.log("AI unavailable. Using fallback.");
        analysis = getFallbackAnalysis(payment, customer);
    }

    const opportunity =
        await RecoveryOpportunity.create({
            customer: customer._id,
            payment: payment._id,
            source: "FAILED_PAYMENT",
            amount: payment.amount,

            recoveryProbability:
                analysis.recoveryProbability,

            priority:
                analysis.priority,

            reason:
                analysis.reason,

            recommendedAction:
                analysis.recommendedAction,

            status: "RECOMMENDED"
        });

    return opportunity;
};

module.exports = {
    analyzeFailedPayment
};
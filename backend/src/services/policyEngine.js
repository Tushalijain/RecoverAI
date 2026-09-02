const evaluateRecoveryAction = (opportunity) => {
    const action = opportunity.recommendedAction;

    // No action is always safe
    if (action === "NO_ACTION") {
        return {
            allowed: true,
            finalAction: "NO_ACTION",
            reason: "AI recommended no recovery action."
        };
    }

    // Retry only for high-confidence opportunities
    if (action === "RETRY_PAYMENT") {
        if (opportunity.recoveryProbability >= 80) {
            return {
                allowed: true,
                finalAction: "RETRY_PAYMENT",
                reason: "High recovery probability allows payment retry."
            };
        }

        return {
            allowed: false,
            finalAction: "SEND_REMINDER",
            reason: "Retry blocked because recovery probability is below 80%."
        };
    }

    // Reminder is low-risk
    if (action === "SEND_REMINDER") {
        return {
            allowed: true,
            finalAction: "SEND_REMINDER",
            reason: "Reminder is permitted."
        };
    }

    // Escalation is also permitted
    if (action === "ESCALATE") {
        return {
            allowed: true,
            finalAction: "ESCALATE",
            reason: "Opportunity requires manual review."
        };
    }

    // Safety fallback
    return {
        allowed: false,
        finalAction: "NO_ACTION",
        reason: "Unsupported recovery action."
    };
};

module.exports = {
    evaluateRecoveryAction
};
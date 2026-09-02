const mongoose = require("mongoose");

const recoveryOpportunitySchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Payment",
            default: null
        },

        source: {
            type: String,
            enum: [
                "FAILED_PAYMENT",
                "SUBSCRIPTION_FAILURE",
                "ABANDONED_CHECKOUT"
            ],
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        recoveryProbability: {
            type: Number,
            min: 0,
            max: 100,
            default: 0
        },

        priority: {
            type: String,
            enum: ["LOW", "MEDIUM", "HIGH"],
            default: "LOW"
        },

        reason: {
            type: String,
            default: ""
        },

        recommendedAction: {
            type: String,
            enum: [
                "RETRY_PAYMENT",
                "SEND_REMINDER",
                "RECOVER_CHECKOUT",
                "ESCALATE",
                "NO_ACTION"
            ],
            default: "NO_ACTION"
        },

        status: {
            type: String,
            enum: [
                "PENDING",
                "RECOMMENDED",
                "EXECUTED",
                "RECOVERED",
                "FAILED"
            ],
            default: "PENDING"
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model(
    "RecoveryOpportunity",
    recoveryOpportunitySchema
);
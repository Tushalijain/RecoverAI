const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
    {
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Customer",
            required: true
        },

        amount: {
            type: Number,
            required: true
        },

        status: {
            type: String,
            enum: [
                "created",
                "authorized",
                "captured",
                "failed",
                "refunded"
            ],
            default: "created"
        },

        failureReason: {
            type: String,
            default: null
        },

        razorpayPaymentId: {
            type: String,
            default: null
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Payment", paymentSchema);
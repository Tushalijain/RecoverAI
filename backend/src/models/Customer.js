const mongoose = require("mongoose");

const customerSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },

        email: {
            type: String,
            required: true,
            unique: true,
            lowercase: true,
            trim: true
        },

        totalPayments: {
            type: Number,
            default: 0
        },

        successfulPayments: {
            type: Number,
            default: 0
        },

        failedPayments: {
            type: Number,
            default: 0
        },

        lifetimeValue: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Customer", customerSchema);
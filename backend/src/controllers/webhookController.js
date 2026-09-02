const crypto = require("crypto");

const handleRazorpayWebhook = async (req, res) => {
    try {
        const webhookSecret =
            process.env.RAZORPAY_WEBHOOK_SECRET;

        const receivedSignature =
            req.headers["x-razorpay-signature"];

        const expectedSignature = crypto
            .createHmac("sha256", webhookSecret)
            .update(req.body)
            .digest("hex");

        if (expectedSignature !== receivedSignature) {
            return res.status(400).json({
                message: "Invalid webhook signature"
            });
        }

        const event = JSON.parse(
            req.body.toString()
        );

        console.log(
            "Razorpay webhook event:",
            event.event
        );

        if (event.event === "payment.failed") {
            const payment =
                event.payload.payment.entity;

            console.log(
                "Failed payment received:",
                payment.id
            );
        }

        return res.status(200).json({
            message: "Webhook received successfully"
        });

    } catch (error) {
        console.error(
            "Webhook processing failed:",
            error.message
        );

        return res.status(500).json({
            message: "Webhook processing failed"
        });
    }
};

module.exports = {
    handleRazorpayWebhook
};
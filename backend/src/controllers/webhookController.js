const crypto = require("crypto");

const Customer = require("../models/Customer");
const Payment = require("../models/Payment");
const WebhookEvent = require("../models/WebhookEvent");
const { analyzeFailedPayment } = require("../services/recoveryEngine");

const handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const receivedSignature = req.headers["x-razorpay-signature"];

    // Verify Razorpay webhook signature
    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(req.body)
      .digest("hex");

    if (expectedSignature !== receivedSignature) {
      return res.status(400).json({
        message: "Invalid webhook signature"
      });
    }

    const event = JSON.parse(req.body.toString());
    const eventId = req.headers["x-razorpay-event-id"];

try {
  await WebhookEvent.create({
    eventId,
    eventType: event.event
  });
} catch (error) {
  if (error.code === 11000) {
    console.log("Duplicate webhook ignored:", eventId);

    return res.status(200).json({
      message: "Duplicate webhook ignored"
    });
  }

  throw error;
}

    console.log("Razorpay webhook event:", event.event);

    // Respond quickly to Razorpay
    res.status(200).json({
      message: "Webhook received successfully"
    });

    // Only process failed payments for now
    if (event.event !== "payment.failed") {
      return;
    }

    const razorpayPayment = event.payload.payment.entity;

    console.log(
      "Failed payment received:",
      razorpayPayment.id
    );

    // Avoid creating same payment twice
    const existingPayment = await Payment.findOne({
      razorpayPaymentId: razorpayPayment.id
    });

    if (existingPayment) {
      console.log("Payment already processed:", razorpayPayment.id);
      return;
    }

    const email =
      razorpayPayment.email ||
      `customer_${razorpayPayment.id}@recoverai.demo`;

    // Find or create customer
    let customer = await Customer.findOne({
      email: email.toLowerCase()
    });

    if (!customer) {
      customer = await Customer.create({
        name: "Razorpay Customer",
        email: email,
        totalPayments: 1,
        successfulPayments: 0,
        failedPayments: 1,
        lifetimeValue: 0
      });
    } else {
      customer.totalPayments += 1;
      customer.failedPayments += 1;
      await customer.save();
    }

    // Razorpay amount is in paise.
    // Our RecoverAI database stores rupees.
    const amountInRupees = razorpayPayment.amount / 100;

    const payment = await Payment.create({
      customer: customer._id,
      amount: amountInRupees,
      status: "failed",

      failureReason:
        razorpayPayment.error_reason ||
        razorpayPayment.error_description ||
        "payment_failed",

      razorpayPaymentId: razorpayPayment.id
    });

    console.log(
      "Failed payment saved:",
      payment._id
    );

    // Send payment into our AI Recovery Engine
    const opportunity = await analyzeFailedPayment(
      payment,
      customer
    );

    console.log(
      "Recovery opportunity created:",
      opportunity._id
    );

  } catch (error) {
    console.error(
      "Webhook processing failed:",
      error.message
    );
  }
};

module.exports = {
  handleRazorpayWebhook
};
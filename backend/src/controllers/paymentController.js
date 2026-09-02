const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

const createOrder = async (req, res) => {
    try {
        const order = await razorpay.orders.create({
            amount: 50000, // ₹500 in paise
            currency: "INR",
            receipt: `receipt_${Date.now()}`
        });

        res.status(201).json({
            message: "Order created successfully",
            order,
            keyId: process.env.RAZORPAY_KEY_ID
        });

    } catch (error) {
        console.error(
            "Razorpay order creation failed:",
            error.response?.data || error.message
        );

        res.status(500).json({
            message: "Order creation failed"
        });
    }
};

module.exports = {
    createOrder
};
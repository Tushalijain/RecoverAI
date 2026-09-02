const webhookRoutes =
    require("./routes/webhookRoutes");
const express = require("express");
const cors = require("cors");
const paymentRoutes = require("./routes/paymentRoutes");



const testRoutes =
    require("./routes/testRoutes");

const recoveryRoutes =
    require("./routes/recoveryRoutes");

const app = express();

app.use(cors());
app.use(express.static("public"));

// Razorpay needs RAW request body
app.use(
    "/api/webhooks",
    webhookRoutes
);

// Normal JSON parsing for all other APIs
app.use(express.json());

app.get("/", (req, res) => {
    res.json({
        message: "RecoverAI backend is running"
    });
});

app.use("/api/test", testRoutes);

app.use(
    "/api/recovery",
    recoveryRoutes
);
app.use("/api/payments", paymentRoutes);

module.exports = app;
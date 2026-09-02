const axios = require("axios");

const analyzeRecoveryOpportunity = async (payment, customer) => {
    try {
        const prompt = `
You are an AI revenue recovery analyst for a payment platform.

Analyze the following failed payment.

Payment:
Amount: ₹${payment.amount}
Failure reason: ${payment.failureReason || "unknown"}

Customer:
Total payments: ${customer.totalPayments}
Successful payments: ${customer.successfulPayments}
Failed payments: ${customer.failedPayments}
Lifetime value: ₹${customer.lifetimeValue}

Your task is to estimate how recoverable this lost revenue is.

Return ONLY valid JSON in this exact format:

{
  "recoveryProbability": 0,
  "priority": "LOW",
  "reason": "short explanation",
  "recommendedAction": "NO_ACTION"
}

Rules:

recoveryProbability must be an integer from 0 to 100.

priority must be one of:
LOW
MEDIUM
HIGH

recommendedAction must be one of:
RETRY_PAYMENT
SEND_REMINDER
ESCALATE
NO_ACTION

Do not include markdown.
Do not include explanation outside the JSON.
`;

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
    model: "google/gemini-2.5-flash",

   messages: [
    {
        role: "system",
        content: `
You are a revenue recovery decision engine.

Return ONLY valid JSON.
Do not use markdown.
Do not include any explanation outside the JSON.
Keep the response concise.
`
    },
    {
        role: "user",
        content: prompt
    }
],
    temperature: 0.2,

    max_tokens: 200
},
            {
                headers: {
                    Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
                    "Content-Type": "application/json"
                }
            }
        );
        console.log(
    "FULL OPENROUTER RESPONSE:",
    JSON.stringify(response.data, null, 2)
);

        const content =
            response.data.choices[0].message.content;

        console.log("Raw AI response:", content);

        const result = JSON.parse(content);

        return result;

    } catch (error) {
        console.error(
            "AI analysis failed:",
            error.response?.data || error.message
        );

        throw new Error("AI recovery analysis failed");
    }
};

module.exports = {
    analyzeRecoveryOpportunity
};
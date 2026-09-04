# RecoverAI — AI-Powered Revenue Recovery Agent

RecoverAI is an AI-powered revenue recovery system built for the **Razorpay Buildathon – Track 3: AI Revenue Recovery**.

It detects failed payment opportunities from Razorpay, analyzes their recovery potential using AI, recommends a bounded recovery action, validates that action through a backend policy engine, and provides businesses with a dashboard to prioritize and track recoverable revenue.

---

## 🚀 Problem Statement

Failed digital payments directly translate into lost revenue for businesses.

However, not every failed payment should be treated in the same way. A high-value returning customer may be worth retrying immediately, while repeatedly failed or intentionally cancelled payments may require a reminder or no action at all.

Manually analyzing these cases is difficult at scale.

**RecoverAI converts failed payment events into prioritized, AI-assisted revenue recovery opportunities.**

---

## 💡 Solution

RecoverAI listens to Razorpay payment failure events and automatically:

1. Detects a failed payment using Razorpay Webhooks.
2. Stores the payment and customer information.
3. Sends relevant payment context to the AI recovery engine.
4. Estimates the probability of recovering the revenue.
5. Assigns a recovery priority.
6. Explains why the payment may or may not be recoverable.
7. Recommends a bounded recovery action.
8. Passes the recommendation through a backend policy engine.
9. Allows eligible recovery actions to be executed.
10. Tracks revenue-at-risk and recovery metrics on a dashboard.

---

## 🔄 End-to-End Flow

```text
Customer
   │
   ▼
Razorpay Test Checkout
   │
   │ Payment Fails
   ▼
Razorpay payment.failed Webhook
   │
   ▼
RecoverAI Backend
   │
   ├── Verify Webhook
   │
   ├── Store Customer + Payment
   │
   ▼
AI Recovery Engine
   │
   ├── Recovery Probability
   ├── Priority
   ├── Reason
   └── Recommended Action
   │
   ▼
Policy Engine
   │
   ├── Allow
   ├── Block
   └── Safe Fallback
   │
   ▼
Recovery Opportunity
   │
   ▼
MongoDB
   │
   ▼
RecoverAI Dashboard
   │
   ├── Revenue at Risk
   ├── Recoverable Revenue
   ├── Recovered Revenue
   ├── Recovery Rate
   └── Execute Recovery
```

---

## ✨ Key Features

### 💳 Razorpay Integration

RecoverAI integrates with **Razorpay Test Mode** to generate and process payment events.

A user can initiate a ₹500 test payment directly from the RecoverAI dashboard.

When the payment fails, Razorpay sends a `payment.failed` webhook to the RecoverAI backend.

---

### ⚡ Real-Time Failed Payment Detection

The backend processes Razorpay webhook events and extracts information such as:

- Payment amount
- Payment ID
- Customer details
- Failure reason
- Payment status

The failed payment is converted into a potential revenue recovery opportunity.

---

### 🤖 AI Recovery Analysis

RecoverAI uses an LLM through **OpenRouter** to analyze failed payments.

The AI produces:

```json
{
  "recoveryProbability": 85,
  "priority": "HIGH",
  "reason": "High-value customer with a strong previous payment history.",
  "recommendedAction": "RETRY_PAYMENT"
}
```

The analysis provides:

- **Recovery Probability** — estimated likelihood of successful recovery
- **Priority** — HIGH, MEDIUM or LOW
- **Reason** — explanation behind the decision
- **Recommended Action** — suggested next recovery step

---

## 🛡️ AI + Policy Engine

RecoverAI does **not** allow the AI model to directly control payment operations.

AI acts as the **decision intelligence layer**, while the backend remains the authority.

Supported bounded actions include:

```text
RETRY_PAYMENT
SEND_REMINDER
ESCALATE
NO_ACTION
```

For example, if AI recommends `RETRY_PAYMENT` but the recovery probability does not satisfy the configured policy threshold, the backend can block the retry and fall back to a safer action such as:

```text
SEND_REMINDER
```

This creates a safer architecture:

```text
AI Recommendation
       ↓
Policy Validation
       ↓
Approved / Blocked
       ↓
Bounded Recovery Action
```

---

## 📊 Revenue Recovery Dashboard

The React dashboard provides businesses with a central view of their recovery pipeline.

### Metrics

- **Revenue at Risk**
- **Recoverable Revenue**
- **Recovered Revenue**
- **Recovery Rate**

### Recovery Opportunities

Each opportunity displays:

- Customer
- Failed amount
- AI recovery score
- Priority
- Recommended action
- Recovery status
- Execute option

Priority and status badges make high-value opportunities easy to identify.

---

## 💰 Recoverable Revenue Calculation

RecoverAI estimates recoverable revenue using the AI-generated probability.

```text
Recoverable Revenue =
Σ (Failed Payment Amount × Recovery Probability)
```

Example:

```text
Failed Payment = ₹10,000
Recovery Probability = 80%

Estimated Recoverable Revenue = ₹8,000
```

This allows businesses to prioritize opportunities based on expected revenue impact rather than treating every failed payment equally.

---

## 🔁 Recovery Execution

Eligible AI recommendations can be executed from the dashboard.

For the current MVP, recovery actions such as reminders and retries are **simulated workflow actions**.

For example:

```text
RECOMMENDED
     ↓
Execute
     ↓
Policy Engine
     ↓
EXECUTED / RECOVERED
```

The architecture is designed so these bounded actions can later connect to production notification, retry, CRM, or payment infrastructure.

---

## 🧠 AI Decision Example

Consider two customers with failed payments.

### Customer A

```text
Amount: ₹8,500
Successful Payments: 7
Failed Payments: 1
Lifetime Value: ₹52,000
```

RecoverAI may classify this opportunity as:

```text
Recovery Probability: 95%
Priority: HIGH
Recommended Action: RETRY_PAYMENT
```

### Customer B

```text
Repeated failures
Payment intentionally cancelled
Low successful-payment history
```

RecoverAI may determine:

```text
Recovery Probability: 10%
Priority: LOW
Recommended Action: NO_ACTION
```

This prevents businesses from wasting recovery effort on every failed transaction.

---

## 🧱 Tech Stack

### Frontend

- React
- Vite
- Axios
- CSS

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose

### AI

- OpenRouter API
- Gemini 2.5 Flash

### Payments

- Razorpay APIs
- Razorpay Test Mode
- Razorpay Webhooks

### Deployment

- Vercel — Frontend
- Render — Backend
- MongoDB Atlas — Database

---

## 📁 Project Structure

```text
RecoverAI/
│
├── backend/
│   ├── public/
│   │   └── checkout.html
│   │
│   └── src/
│       ├── config/
│       │   └── db.js
│       │
│       ├── controllers/
│       │   ├── paymentController.js
│       │   ├── recoveryController.js
│       │   └── webhookController.js
│       │
│       ├── models/
│       │   ├── Customer.js
│       │   ├── Payment.js
│       │   ├── RecoveryOpportunity.js
│       │   └── WebhookEvent.js
│       │
│       ├── routes/
│       │   ├── paymentRoutes.js
│       │   ├── recoveryRoutes.js
│       │   └── webhookRoutes.js
│       │
│       ├── services/
│       │   ├── aiService.js
│       │   ├── policyEngine.js
│       │   └── recoveryEngine.js
│       │
│       ├── app.js
│       └── server.js
│
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── App.css
│       └── index.css
│
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file inside the `backend` directory.

```env
MONGO_URI=your_mongodb_connection_string

OPENROUTER_API_KEY=your_openrouter_api_key

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret

RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

PORT=5000
```

> ⚠️ Never commit `.env` or API secrets to GitHub.

---

## 🛠️ Local Installation

### 1. Clone the repository

```bash
git clone https://github.com/Tushalijain/RecoverAI.git
cd RecoverAI
```

### 2. Install backend dependencies

```bash
cd backend
npm install
```

Create the required `.env` file and then run:

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

### 3. Install frontend dependencies

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🧪 Testing the Complete Flow

1. Open the RecoverAI dashboard.
2. Click **Test ₹500 Payment**.
3. Razorpay Test Checkout opens.
4. Trigger a failed payment in Razorpay Test Mode.
5. Razorpay sends a `payment.failed` webhook.
6. RecoverAI verifies and processes the event.
7. Customer/payment information is stored.
8. AI analyzes the recovery opportunity.
9. Return to the dashboard.
10. Click **Refresh Opportunities**.
11. View the new AI-generated recovery opportunity.
12. Execute the recovery action when eligible.

This demonstrates the complete:

```text
Payment → Detection → AI Decision → Policy → Recovery
```

pipeline.

---

## 🔐 Reliability & Safety

RecoverAI includes several backend safeguards:

- Razorpay webhook signature verification
- Webhook event idempotency
- Duplicate-event protection
- AI output validation
- Rule-based AI fallback
- Bounded recovery actions
- Backend policy validation
- No direct arbitrary financial control by the LLM

---

## 🎯 Current MVP Scope

The current working MVP focuses on:

> **AI-assisted recovery of Razorpay failed payments.**

It fully demonstrates the architecture using the `payment.failed` event.

The data model and recovery engine are designed to support additional revenue-loss sources in future versions.

---

## 🔮 Future Scope

RecoverAI can be extended with:

- Subscription payment failure recovery
- Abandoned checkout recovery
- Real email/SMS/WhatsApp recovery reminders
- Production payment retry orchestration
- Automated recovery campaigns
- Merchant-defined policy rules
- Customer segmentation
- Recovery history and audit logs
- Advanced analytics and forecasting
- Multi-channel recovery strategies
- Human approval for high-risk recovery actions

---

## 🏆 Why RecoverAI?

Most payment dashboards tell businesses:

> “This payment failed.”

RecoverAI asks the more valuable question:

> **“Can we recover this revenue, and what should we do next?”**

Instead of treating all failed transactions equally, RecoverAI combines payment signals, customer history, AI reasoning and backend policies to turn payment failures into actionable revenue recovery opportunities.

---

## 👩‍💻 Built For

**Razorpay Buildathon — Track 3: AI Revenue Recovery**

Built by **Tushali Jain**

---

## 📌 Project Status

**Working MVP**

- ✅ Razorpay Test Payment
- ✅ `payment.failed` Webhook
- ✅ Webhook Signature Verification
- ✅ MongoDB Persistence
- ✅ AI Recovery Analysis
- ✅ Recovery Probability
- ✅ Priority Classification
- ✅ AI Reasoning
- ✅ Bounded Action Recommendation
- ✅ Backend Policy Engine
- ✅ Recovery Execution Simulation
- ✅ Revenue Recovery Dashboard
- ✅ Vercel Frontend Deployment
- ✅ Render Backend Deployment

---

## 📄 Disclaimer

RecoverAI currently operates as a hackathon MVP using Razorpay Test Mode.

Recovery execution is simulated for demonstration purposes. No real customer payment retries, messages, or financial transactions are automatically initiated by the AI.
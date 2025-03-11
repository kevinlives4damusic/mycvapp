// Import Express and its types
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const { PaymentController } = require('./controllers/payment.controller');

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const paymentController = new PaymentController();

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginOpenerPolicy: { policy: "unsafe-none" }
}));

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json()); // Parse JSON bodies

// Routes
app.post('/api/payments/verify', (req, res) => paymentController.verifyPayment(req, res));
app.get('/api/payments/:paymentId', (req, res) => paymentController.getPayment(req, res));
app.get('/api/subscriptions/:userId', (req, res) => paymentController.getUserSubscription(req, res));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
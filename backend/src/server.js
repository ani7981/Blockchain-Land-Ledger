'use strict';

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const propertyRoutes = require('./routes/propertyRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const errorHandler = require('./middleware/errorHandler');
const fabricService = require('./services/fabricService');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for frontend clients
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parser
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[HTTP] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    service: 'digital-land-registry-backend',
    channel: process.env.CHANNEL_NAME || 'landchannel',
    chaincode: process.env.CHAINCODE_NAME || 'landregistry',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/properties', propertyRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Global Error Handler
app.use(errorHandler);

// Start server if run directly
if (require.main === module) {
  fabricService.initialize().then(() => {
    app.listen(PORT, () => {
      console.log(`====================================================`);
      console.log(`  Digital Land Registry Backend Server Running     `);
      console.log(`  URL: http://localhost:${PORT}                     `);
      console.log(`  Channel: landchannel | Chaincode: landregistry   `);
      console.log(`====================================================`);
    });
  });
}

module.exports = app;

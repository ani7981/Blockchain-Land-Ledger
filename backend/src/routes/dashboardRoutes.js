'use strict';

const express = require('express');
const router = express.Router();
const fabricService = require('../services/fabricService');

// Dashboard summary endpoint
router.get('/summary', async (req, res, next) => {
  try {
    const summary = await fabricService.getDashboardSummary();
    res.status(200).json({
      success: true,
      message: 'Dashboard summary retrieved successfully',
      data: summary
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

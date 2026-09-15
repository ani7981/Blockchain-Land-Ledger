'use strict';

const express = require('express');
const router = express.Router();
const fabricService = require('../services/fabricService');

// 1. Create Property
router.post('/', async (req, res, next) => {
  try {
    const {
      parcelId,
      surveyNumber,
      ownerId,
      ownerName,
      propertyType = 'Residential',
      documentHash,
      requestedByRole = 'REGISTRATION_OFFICER',
      officerId = 'OFFICER-001'
    } = req.body;

    // Validation checks
    if (!parcelId || !parcelId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Parcel ID is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }
    if (!surveyNumber || !surveyNumber.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Survey number is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }
    if (!ownerId || !ownerId.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Owner ID is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }
    if (!ownerName || !ownerName.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Owner name is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }
    if (!documentHash || !documentHash.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Document hash is required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const result = await fabricService.createProperty(
      parcelId.trim(),
      surveyNumber.trim(),
      ownerId.trim(),
      ownerName.trim(),
      propertyType,
      documentHash.trim(),
      requestedByRole,
      officerId
    );

    res.status(201).json({
      success: true,
      message: 'Property registered successfully on blockchain',
      transactionId: result.transactionId,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
});

// 2. Get All Properties
router.get('/', async (req, res, next) => {
  try {
    const properties = await fabricService.getAllProperties();
    res.status(200).json({
      success: true,
      message: 'Properties retrieved successfully',
      data: properties
    });
  } catch (err) {
    next(err);
  }
});

// 3. Get Property by Parcel ID
router.get('/:parcelId', async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const property = await fabricService.getProperty(parcelId);
    res.status(200).json({
      success: true,
      message: 'Property retrieved successfully',
      data: property
    });
  } catch (err) {
    next(err);
  }
});

// 4. Request Title Transfer
router.post('/:parcelId/transfer', async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const {
      currentOwnerId,
      buyerId,
      buyerName,
      requestedByRole = 'LAND_OWNER'
    } = req.body;

    if (!currentOwnerId || !buyerId || !buyerName) {
      return res.status(400).json({
        success: false,
        message: 'Current owner ID, buyer ID, and buyer name are required',
        errorCode: 'VALIDATION_ERROR'
      });
    }

    const result = await fabricService.requestTitleTransfer(
      parcelId,
      currentOwnerId,
      buyerId,
      buyerName,
      requestedByRole
    );

    res.status(200).json({
      success: true,
      message: 'Title transfer request submitted successfully',
      transactionId: result.transactionId,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
});

// 5. Approve Title Transfer
router.post('/:parcelId/approve', async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const {
      officerId = 'OFFICER-001',
      requestedByRole = 'REGISTRATION_OFFICER'
    } = req.body;

    const result = await fabricService.approveTitleTransfer(
      parcelId,
      requestedByRole,
      officerId
    );

    res.status(200).json({
      success: true,
      message: 'Title transfer approved successfully',
      transactionId: result.transactionId,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
});

// 6. Reject Title Transfer
router.post('/:parcelId/reject', async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const {
      officerId = 'OFFICER-001',
      reason = 'Required sale-deed verification is incomplete',
      requestedByRole = 'REGISTRATION_OFFICER'
    } = req.body;

    const result = await fabricService.rejectTitleTransfer(
      parcelId,
      reason,
      requestedByRole,
      officerId
    );

    res.status(200).json({
      success: true,
      message: 'Title transfer rejected successfully',
      transactionId: result.transactionId,
      data: result.data
    });
  } catch (err) {
    next(err);
  }
});

// 7. Get Property History
router.get('/:parcelId/history', async (req, res, next) => {
  try {
    const { parcelId } = req.params;
    const history = await fabricService.getPropertyHistory(parcelId);
    res.status(200).json({
      success: true,
      message: 'Property history retrieved successfully',
      data: history
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;

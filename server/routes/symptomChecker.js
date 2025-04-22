const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const logger = require('../utils/logger');
const { predictDisease, getRecommendedDoctors } = require('../utils/symptomCheckerUtils');

// Symptom Checker Route
router.post('/check-symptoms', async (req, res) => {
  try {
    const { symptoms } = req.body;

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return res.status(400).json({ message: 'Symptoms are required and should be an array.' });
    }

    logger.info(`Symptom checker input: ${symptoms}`);

    // Predict the disease using the model
    const disease = await predictDisease(symptoms);

    // Get recommended doctors based on the disease
    const recommendedDoctors = await getRecommendedDoctors(disease);

    res.status(200).json({
      disease,
      recommendedDoctors
    });
  } catch (error) {
    logger.error('Error in symptom checker:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
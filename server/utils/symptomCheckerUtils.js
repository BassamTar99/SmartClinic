const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const { PythonShell } = require('python-shell');

// Load the model and label encoder paths
const modelPath = path.join(__dirname, '../models/symptom_checker_model.pkl');
const labelEncoderPath = path.join(__dirname, '../models/symptom_checker_label_encoder.pkl');

// Predict disease based on symptoms
async function predictDisease(symptoms) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: path.join(__dirname, '../scripts'),
      args: [JSON.stringify(symptoms), modelPath, labelEncoderPath]
    };

    PythonShell.run('symptom_checker.py', options, (err, results) => {
      if (err) {
        logger.error('Error in Python script:', err);
        return reject(err);
      }

      try {
        const disease = JSON.parse(results[0]);
        resolve(disease);
      } catch (parseError) {
        logger.error('Error parsing Python script output:', parseError);
        reject(parseError);
      }
    });
  });
}

// Get recommended doctors based on the disease
async function getRecommendedDoctors(disease) {
  // Mock implementation - Replace with database query or logic
  const doctorSpecialties = {
    "Cardiology": ["Dr. Smith", "Dr. Johnson"],
    "Dermatology": ["Dr. Brown", "Dr. Davis"],
    "Neurology": ["Dr. Wilson", "Dr. Martinez"]
  };

  return doctorSpecialties[disease] || [];
}

module.exports = {
  predictDisease,
  getRecommendedDoctors
};
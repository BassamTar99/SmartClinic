const path = require('path');
const fs = require('fs');
const logger = require('./logger');
const { PythonShell } = require('python-shell');


// Predict disease based on symptoms
async function predictDisease(symptoms) {
  return new Promise((resolve, reject) => {
    const options = {
      mode: 'text',
      pythonOptions: ['-u'],
      scriptPath: path.resolve(__dirname, '../scripts'), // Use absolute path
      args: [typeof symptoms === 'string' ? symptoms : symptoms.join(', ')],
      timeout: 20 // seconds, to prevent hanging forever
    };
    logger.info('[predictDisease] Launching PythonShell with options:', options);
    PythonShell.run('symptom_checker.py', options, (err, results) => {
      logger.info('[predictDisease] PythonShell callback fired. err:', err, 'results:', results);
      if (err) {
        logger.error('Error in Python script:', err);
        return reject(err);
      }
      try {
        const disease = JSON.parse(results[0]);
        resolve(disease);
      } catch (parseError) {
        logger.error('Error parsing Python script output:', parseError, 'results:', results);
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
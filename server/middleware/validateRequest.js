const Joi = require('joi');

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: error.details[0].message
      });
    }
    next();
  };
};

// Validation schemas
const schemas = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  }),

  register: Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('patient', 'doctor').required()
  }),

  appointment: Joi.object({
    date: Joi.date().required(),
    time: Joi.string().required(),
    doctorId: Joi.string().required(),
    patientId: Joi.string().required(),
    symptoms: Joi.string().required(),
    notes: Joi.string().allow('')
  }),

  updateAppointment: Joi.object({
    status: Joi.string().valid('pending', 'confirmed', 'cancelled', 'completed'),
    notes: Joi.string().allow('')
  })
};

module.exports = {
  validateRequest,
  schemas
}; 
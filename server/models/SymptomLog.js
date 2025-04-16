const mongoose = require('mongoose');

const SymptomLogSchema = new mongoose.Schema({
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  symptoms: [{
    name: {
      type: String,
      required: true
    },
    severity: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },
    duration: {
      type: String,
      required: true
    }
  }],
  additionalNotes: {
    type: String
  },
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('SymptomLog', SymptomLogSchema); 
const mongoose = require('mongoose');

const PointSchema = new mongoose.Schema({
  type: {
    type: String,
    // 'location.type' deve ser 'Point' ou 'Polygon'
    enum: ['Point'],
    required: true
  },

  coordinates: {
    type: [Number],
    required: true
  }
});

module.exports = PointSchema;
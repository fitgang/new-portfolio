const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  linkedin: {
    type: String,
    required: true
  },

  occupation: {
    role: {
      type: String,
      required: true
    },
    organization: {
      type: String,
      required: true
    }
  },

  fulfil: {
    choice: {
      type: String,
      required: true
    },
    suggestions: String
  },

  color: {
    choice: {
      type: String,
      required: true
    },
    suggestions: String
  },

  rating: {
    type: String,
    required: true
  },

  internship: {
    choice: {
      type: String,
      required: true
    },
    suggestions: String
  },

  comments: {
    type: String,
    required: true
  }
})

module.exports = mongoose.model("Review", reviewSchema);
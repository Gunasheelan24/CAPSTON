const mongoose = require("mongoose");

const booking = new mongoose.Schema({
  from: {
    type: String,
    required: true,
  },
  startPoint: {
    type: String,
    required: true,
  },
  StateFrom: {
    type: String,
    required: true,
  },
  startcode: {
    type: String,
    required: true,
  },
  to: {
    type: String,
    required: true,
  },
  EndingPoint: {
    type: String,
    required: true,
  },
  StateTo: {
    type: String,
    required: true,
  },
  endcode: {
    type: String,
    required: true,
  },
});

const model = mongoose.model("paris", booking);
exports.model = model;

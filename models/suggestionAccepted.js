const mongoose = require("mongoose");

const suggestionSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    trim: true,
  },
  token: {
    type: String,
    required: true,
    trim: true,
  },
  docId: {
    type: String,
    required: true,
    trim: true,
  },
});

const SuggestionAcceptedModel = mongoose.model(
  "suggestionAcceptedModel",
  suggestionSchema
);
module.exports = SuggestionAcceptedModel;

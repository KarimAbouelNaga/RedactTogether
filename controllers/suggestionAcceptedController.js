const SuggestionAcceptedModel = require("../models/suggestionAccepted");

exports.suggestionAcceptedByUserId = async function (req, res) {
  try {
    const suggestions = await SuggestionAcceptedModel.find({
      userId: req.params.id,
      docId: req.params.docid,
    });

    res.status(200).json({
      status: "success",
      results: suggestions.length,
      data: {
        suggestions,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.deleteSuggestionAccepted = async function (req, res) {
  console.log("delete suggestion controller");
  try {
    await SuggestionAcceptedModel.deleteMany({ token: req.params.id });

    res.status(200).json({
      status: "success",
      message: "document deleted",
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

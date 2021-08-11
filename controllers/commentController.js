const CommentModel = require("../models/commentModel");

exports.allCommentsByDocId = async function (req, res) {
  try {
    const allComments = await CommentModel.find({ docId: req.params.id });

    res.status(200).json({
      status: "success",
      results: allComments.length,
      data: {
        allComments,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.createNewComment = async function (req, res) {
  try {
    const comment = await CommentModel.create({
      ...req.body,
    });

    res.status(200).json({
      status: "success",
      data: {
        comment,
      },
    });
  } catch (err) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

exports.delteComment = async function (req, res) {
  try {
    await CommentModel.deleteMany({ token: req.params.id });
    res.status(200).json({
      status: "success",
      message: "document deleted",
    });
  } catch (error) {
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

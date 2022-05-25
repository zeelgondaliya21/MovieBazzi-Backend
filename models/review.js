const Joi = require("joi");
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  rating: {
    type: Number,
    required: true,
    default: 0,
    minlength: 0,
    maxlength: 10,
  },
  review: {
    type: String,
    required: true,
    trim: true,
  },
  userID: {
    type: String,
    required: true,
  },
  userName: {
    type: String,
    required: true,
  },
  mediaType: {
    type: String,
    required: true,
  },
  mediaID: {
    type: String,
    required: true,
  },
  mediaName: {
    type: String,
    required: true,
  },
  mediaPoster: {
    type: String,
    required: true,
  },
  reportCount: {
    type: [{ userID: String, userName: String, reason: String }],
  },
  likeCount: {
    type: [{ userID: String, userName: String }],
  },
  dislikeCount: {
    type: [{ userID: String, userName: String }],
  },
});

const Review = mongoose.model("Review", reviewSchema);

function validateReview(review) {
  const schema = Joi.object().keys({
    rating: Joi.number().required().min(0).max(10),
    review: Joi.string().required().trim(),
    userID: Joi.string(),
    userName: Joi.string(),
    mediaType: Joi.string().required(),
    mediaID: Joi.string().required(),
    mediaName: Joi.string().required(),
    mediaPoster: Joi.string().required(),
    reportCount: Joi.array().items(
      Joi.object().keys({
        userID: Joi.string(),
        userName: Joi.string(),
        reason: Joi.string(),
      })
    ),
    likeCount: Joi.array().items(
      Joi.object().keys({
        userID: Joi.string(),
        userName: Joi.string(),
      })
    ),
    dislikeCount: Joi.array().items(
      Joi.object().keys({
        userID: Joi.string(),
        userName: Joi.string(),
      })
    ),
  });
  return schema.validate(review);
}

exports.Review = Review;
exports.validate = validateReview;

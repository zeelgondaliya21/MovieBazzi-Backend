const Joi = require("joi");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
  watchlist: [
    {
      mediaType: String,
      mediaID: String,
      mediaName: String,
      mediaPoster: String,
    },
  ],
});

userSchema.methods.generateAuthToken = function () {
  const token = jwt.sign(
    {
      _id: this._id,
      name: this.name,
      email: this.email,
      isAdmin: this.isAdmin,
    },
    process.env.JWT_KEY
  );
  return token;
};

const User = mongoose.model("User", userSchema);

function validateUser(user) {
  const schema = Joi.object().keys({
    name: Joi.string().required(),
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    watchlist: Joi.array().items(
      Joi.object().keys({
        mediaType: Joi.string(),
        mediaID: Joi.string(),
        mediaName: Joi.string().required(),
        mediaPoster: Joi.string().required(),
      })
    ),
  });
  return schema.validate(user);
}

exports.User = User;
exports.validate = validateUser;

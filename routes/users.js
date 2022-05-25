const auth = require("../middleware/auth");
const Joi = require("joi");
const bcrypt = require("bcrypt");
const _ = require("lodash");
const { User, validate } = require("../models/user");
const { Review } = require("../models/review");
const mongoose = require("mongoose");
const express = require("express");
const admin = require("../middleware/admin");
const router = express.Router();

// -----------------------------------------------------------------------------------
//ADMIN
// -----------------------------------------------------------------------------------

router.get("/admin", [auth, admin], async (req, res) => {
  const users = await User.find({ isAdmin: false });
  res.send(users);
});

// -----------------------------------------------------------------------------------

router.delete("/admin", [auth, admin], (req, res) => {
  User.findByIdAndDelete(req.body.userID, async function (err, user) {
    if (err) {
      console.log(err);
    } else {
      await Review.deleteMany({ userID: req.body.userID });
      res.send(user);
    }
  });
});

// -----------------------------------------------------------------------------------
//USER
// -----------------------------------------------------------------------------------

router.get("/me", auth, async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");
  res.send(user);
});

router.put("/me/changepassword", auth, async (req, res) => {
  let user = await User.findById(req.user._id);

  const validPassword = await bcrypt.compare(req.body.old, user.password);
  if (!validPassword) return res.status(400).send("Invalid password.");

  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.new, salt);
  await user.save();

  res.send(user);
});

router.delete("/me", auth, (req, res) => {
  User.findByIdAndDelete(req.user._id, async function (err, user) {
    if (err) {
      console.log(err);
    } else {
      await Review.deleteMany({ userID: req.user._id });
      res.send(user);
    }
  });
});

// -----------------------------------------------------------------------------------

router.put("/me/watchlist", auth, async (req, res) => {
  let flag = 0;

  const user = await User.findById(req.user._id);

  const { error } = validateWatchlist(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  user.watchlist.forEach((element) => {
    if (
      element.mediaID === req.body.mediaID &&
      element.mediaType === req.body.mediaType
    ) {
      flag = 1;
      return res.status(400).send("Already Added!!!!");
    }
  });

  if (flag === 0) {
    user.watchlist.push({
      mediaType: req.body.mediaType,
      mediaID: req.body.mediaID,
      mediaName: req.body.mediaName,
      mediaPoster: req.body.mediaPoster,
    });

    user.save();
    res.send(user);
  }
});

function validateWatchlist(t) {
  const schema = Joi.object().keys({
    mediaType: Joi.string().required(),
    mediaID: Joi.string().required(),
    mediaName: Joi.string().required(),
    mediaPoster: Joi.string().required(),
  });

  return schema.validate(t);
}

// -----------------------------------------------------------------------------------

router.delete("/me/watchlist", auth, async (req, res) => {
  const user = await User.findById(req.user._id);

  const index = user.watchlist.findIndex((item) => {
    return item._id === req.body.id;
  });

  user.watchlist.splice(index, 1);

  user.save();
  res.send(user);
});

// -----------------------------------------------------------------------------------

router.post("/register", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User already registered.");

  user = new User(_.pick(req.body, ["name", "email", "password"]));
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  await user.save();

  const token = user.generateAuthToken();
  res.send(token);
});

// -----------------------------------------------------------------------------------

router.post("/login", async (req, res) => {
  console.log("login req.body", req.body);
  const { error } = validateLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = user.generateAuthToken();
  res.send(token);
});

function validateLogin(req) {
  const schema = Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
  });

  return schema.validate(req);
}

// -----------------------------------------------------------------------------------

module.exports = router;

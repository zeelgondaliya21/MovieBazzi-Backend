const auth = require("../middleware/auth");
const _ = require("lodash");
const { Review, validate } = require("../models/review");
const mongoose = require("mongoose");
const express = require("express");
const admin = require("../middleware/admin");
const router = express.Router();

// -----------------------------------------------------------------------------------
//ADMIN
// -----------------------------------------------------------------------------------

router.get("/admin", [auth, admin], async (req, res) => {
  try {
    const review = await Review.find();
    res.send(review);
  } catch (error) {
    console.log(error);
  }
});

// -----------------------------------------------------------------------------------

router.delete("/admin", [auth, admin], (req, res) => {
  Review.findByIdAndDelete(req.body.reviewID, function (err, reviews) {
    if (err) {
      console.log(err);
    } else {
      res.send(reviews);
    }
  });
});

// router.delete("/admin", [auth, admin], async (req, res) => {
//   const reviews = await Review.findByIdAndDelete({ _id: req.body.reviewID });
//   res.send(reviews);
// });

// -----------------------------------------------------------------------------------
//USER
// -----------------------------------------------------------------------------------

router.get("/me/getall", auth, async (req, res) => {
  try {
    const review = await Review.find({ userID: req.user._id });
    res.send(review);
  } catch (error) {
    console.log(error);
  }
});

// -----------------------------------------------------------------------------------

router.delete("/me/delete", auth, (req, res) => {
  Review.findByIdAndDelete(req.body.reviewID, function (err, reviews) {
    if (err) {
      console.log(err);
    } else {
      res.send(reviews);
    }
  });
});

// -----------------------------------------------------------------------------------

router.post("/me/give", auth, async (req, res) => {
  try {
    const { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const review = new Review({
      rating: req.body.rating,
      review: req.body.review,
      userID: req.user._id,
      userName: req.user.name,
      mediaType: req.body.mediaType,
      mediaID: req.body.mediaID,
      mediaName: req.body.mediaName,
      mediaPoster: req.body.mediaPoster,
    });

    await review.save();
    res.send(review);
  } catch (error) {
    console.log(error);
  }
});

// -----------------------------------------------------------------------------------

router.put("/me/like", auth, async (req, res) => {
  try {
    let flag = 0;
    let review = await Review.findById(req.body.reviewID);
    if (!review) return res.status(400).send("Review Not founnd");

    review.likeCount.forEach((i) => {
      if (i.userID === req.user._id) {
        flag = 1;
        return res.status(400).send("You have liked Already");
      }
    });

    if (flag === 0) {
      review.dislikeCount = review.dislikeCount.filter((i) => {
        return i.userID !== req.user._id;
      });

      review.likeCount.push({
        userID: req.user._id,
        userName: req.user.name,
      });

      await review.save();
      res.send(review);
    }
  } catch (error) {
    console.log(error);
  }
});

// -----------------------------------------------------------------------------------

router.put("/me/dislike", auth, async (req, res) => {
  try {
    let flag = 0;
    let review = await Review.findById(req.body.reviewID);
    if (!review) return res.status(400).send("Review Not founnd");

    review.dislikeCount.forEach((i) => {
      if (i.userID === req.user._id) {
        flag = 1;
        return res.status(400).send("You have disliked Already");
      }
    });

    if (flag === 0) {
      review.likeCount = review.likeCount.filter((i) => {
        return i.userID !== req.user._id;
      });

      review.dislikeCount.push({
        userID: req.user._id,
        userName: req.user.name,
      });

      await review.save();
      res.send(review);
    }
  } catch (error) {
    console.log(error);
  }
});

// -----------------------------------------------------------------------------------

router.put("/me/report", auth, async (req, res) => {
  try {
    let flag = 0;

    let review = await Review.findById(req.body.reviewID);
    if (!review) return res.status(400).send("Review Not founnd");

    review.reportCount.forEach((i) => {
      if (i.userID === req.user._id) {
        flag = 1;
        return res.status(400).send("You have reported Already");
      }
    });

    if (flag === 0) {
      review.reportCount.push({
        userID: req.user._id,
        userName: req.user.name,
        reason: req.body.reason,
      });

      await review.save();
      res.send(review);
    }
  } catch (error) {
    console.log(error);
  }
});

// -----------------------------------------------------------------------------------
//GENERAL
// -----------------------------------------------------------------------------------

router.post("/general", async (req, res) => {
  try {
    const review = await Review.find({
      mediaType: req.body.mediaType,
      mediaID: req.body.mediaID,
    });
    res.send(review);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;

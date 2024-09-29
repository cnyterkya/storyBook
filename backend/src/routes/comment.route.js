const express = require("express");
const Comment = require("../model/comment.model");
const router = express.Router();

//create a comment
router.post("/post-comment", async (req, res) => {
  try {
    const newComment = new Comment({ ...req.body });
    await newComment.save();
    res.status(200).send({
      message: "Comment created successfully",
      comment: newComment,
    });
  } catch (error) {
    console.error("Error creating comment: ", error);
    res.status(500).send("Error creating comment");
  }
});

//get all comments counts

router.get("/total-comments", async (req, res) => {
  try {
    const totalComment = await Comment.countDocuments();
    res.status(200).send({
      message: "Total comments count",
      totalComment,
    });
  } catch (error) {
    console.error("Error getting comment count: ", error);
    res.status(500).send("Error getting comment count");
  }
});
module.exports = router;

const express = require("express");
const Blog = require("../model/blog.model");
const Comment = require("../model/comment.model");
const verifyToken = require("../middleware/verifyToken");
const isAdmin = require("../middleware/isAdmin");

const router = express.Router();

//create a blog post
router.post("/create-post", verifyToken, isAdmin, async (req, res) => {
  try {
    const newPost = new Blog({ ...req.body, author: req.userId });
    await newPost.save();
    res.status(201).send({
      message: "Post created successfully",
      post: newPost,
    });
  } catch (error) {
    console.log("Error creating post: ", error);
    res.status(500).send({ message: "Error creating post" });
  }
});

//get all blogs
router.get("/", async (req, res) => {
  try {
    const { search, category, location } = req.query;
    let query = {};

    if (search) {
      query = {
        ...query,
        $or: [
          { title: { $regex: search, $options: "i" } },
          { content: { $regex: search, $options: "i" } },
        ],
      };
    }

    if (category) {
      query = {
        ...query,
        category,
      };
    }

    if (location) {
      query = {
        ...query,
        location,
      };
    }
    const posts = await Blog.find(query).populate('author', 'email').sort({ createdAt: -1 });
    res.status(200).send({
      message: "All posts successfully",
      post: posts,
    });
  } catch (error) {
    console.log("Error fetching posts: ", error);
    res.status(500).send({ message: "Error fetching posts" });
  }
});

// get post by id
router.get("/:id", async (req, res) => {
  try {
    const postId = req.params.id;
    const post = await Blog.findById(postId);
    if (!post) {
      return res.status(404).send({
        message: "Post not found",
      });
    }
    const comment = await Comment.find({ postId: postId }).populate(
      "user",
      "username email",
    );
    res.status(200).send({
      message: "Post retrieved successfully",
      post: post,
    });
  } catch (error) {
    console.log("Error fetching single post: ", error);
    res.status(500).send({ message: "Error fetching single post" });
  }
});

// update post by id
router.patch("/update-post/:id", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const updatedPost = await Blog.findByIdAndUpdate(
      postId,
      { ...req.body },
      { new: true },
    );
    if (!updatedPost) {
      return res.status(404).send({
        message: "Post not found",
      });
    }
    res.status(200).send({
      message: "Post updated successfully",
      post: updatedPost,
    });
  } catch (error) {
    console.log("Error updating post: ", error);
    res.status(500).send({ message: "Error updating post" });
  }
});

//delete a blog post
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const deletedPost = await Blog.findByIdAndDelete(postId);
    if (!deletedPost) {
      return res.status(404).send({
        message: "Post not found",
      });
    }
    await Comment.deleteMany({ postId: postId });
    res.status(200).send({
      message: "Post deleted successfully",
      post: deletedPost,
    });
  } catch (error) {
    console.log("Error deleting post: ", error);
    res.status(500).send({ message: "Error deleting post" });
  }
});

//related posts
router.get("/related/:id", verifyToken, async (req, res) => {
  try {
    const { id } = req.params;
    if (!id) {
      return res.status(400).send({
        message: "Please provide a valid id",
      });
    }
    const post = await Blog.findById(id);
    if (!post) {
      return res.status(404).send({
        message: "Post not found",
      });
    }
    const titleRegex = new RegExp(post.title.split(" ").join("|"), "i");
    const relatedQuery = {
      _id: { $ne: id },
      title: { $regex: titleRegex },
    };
    const relatedPosts = await Blog.find(relatedQuery);
    res.status(200).send({
      message: "Related posts retrieved successfully",
      post: relatedPosts,
    });
  } catch (error) {
    console.log("Error fetching related posts: ", error);
    res.status(500).send({ message: "Error fetching related posts" });
  }
});

module.exports = router;

const express = require("express");
const postRouter = express.Router();
const Post = require("../models/post");
const middleware = require("../middleware");
const Forum = require("../models/forum");

postRouter.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("posts/new", { page: "forum" });
});

postRouter.post("/", middleware.isLoggedIn, (req, res) => {
  Forum.find({}, (err, foundForums) => {
    const newPost = {
      title: req.body.title,
      content: req.body.description,
      author: { id: req.user.id, username: req.user.username },
      forum: foundForums[0].id
    };
    Post.create(newPost, (err, createdPost) => {
      if (err) {
        req.flash("error", "There was an error creating the post.");
        return res.redirect("back");
      }
      console.log(createdPost);
      res.redirect("/forums/" + foundForums[0].id);
    });
  });
});

module.exports = postRouter;

const express = require("express");
const forumRouter = express.Router();
const Forum = require("../models/forum");
const Topic = require("../models/topic");
const middleware = require("../middleware");
const Post = require("../models/post");

forumRouter.get("/", middleware.isLoggedIn, (req, res) => {
  Topic.find({}, (err, foundTopics) => {
    if (err) {
      req.flash("error", "There was an error finding the topics.");
      return res.redirect("back");
    }
    Forum.find({}, (err, foundForums) => {
      if (err) {
        req.flash("error", "there was an error finding forums.");
        return res.redirect("back");
      }
      res.render("forums/index", {
        page: "forum",
        topics: foundTopics,
        forums: foundForums
      });
    });
  });
});

forumRouter.get("/new", middleware.isLoggedIn, (req, res) => {
  res.render("forums/new", { page: "forum" });
});

forumRouter.get("/:forum_id", middleware.isLoggedIn, (req, res) => {
  Forum.findById(req.params.forum_id, (err, foundForum) => {
    if (err) {
      req.flash("error", "There was an error finding the forum.");
      return res.redirect("back");
    }
    Post.find()
      .where("forum")
      .equals(foundForum._id)
      .exec((err, foundPosts) => {
        if (err) {
          req.flash("error", "there was an error finding posts.");
          return res.redirect("back");
        }
        res.render("forums/show", {
          page: "forum",
          forum: foundForum,
          posts: foundPosts
        });
      });
  });
});

forumRouter.post("/", middleware.isLoggedIn, (req, res) => {
  Topic.find({}, (err, foundTopics) => {
    const newForum = {
      title: req.body.title,
      description: req.body.description,
      author: { id: req.user.id, username: req.user.username },
      topic: foundTopics[0].id
    };
    Forum.create(newForum, (err, createdForum) => {
      if (err) {
        req.flash("error", "There was an error creating the forum.");
        return res.redirect("back");
      }
      console.log(createdForum);
      res.redirect(`/forums`);
    });
  });
});

module.exports = forumRouter;

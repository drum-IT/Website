const express = require("express");
const forumRouter = express.Router();
const Forum = require("../models/forum");
const Topic = require("../models/topic");
const middleware = require("../middleware");
const Post = require("../models/post");

forumRouter.get("/", middleware.isLoggedIn, (req, res) => {
	Topic.find({})
		.populate("forums")
		.exec((err, foundTopics) => {
			res.render("forums/index", { page: "forum", topics: foundTopics });
		});
});

forumRouter.get("/new/:topic_id", middleware.isLoggedIn, (req, res) => {
	Topic.findById(req.params.topic_id, (err, foundTopic) => {
		if (!foundTopic) {
			req.flash("error", "No topic with that ID was found.");
			return res.redirect("/forums");
		}
		res.render("forums/new", { page: "forum", topicId: req.params.topic_id });
	});
});

forumRouter.get("/:forum_id", middleware.isLoggedIn, (req, res) => {
	Forum.findById(req.params.forum_id).populate("posts").exec((err, foundForum) => {
		if (err) {
			req.flash("error", "There was an error finding the forum.");
			return res.redirect("/forums");
		}
		res.render("forums/show", { page: "forum", forum: foundForum });
	})
});

forumRouter.post("/:topic_id", middleware.isLoggedIn, (req, res) => {
	Topic.findById(req.params.topic_id, (err, foundTopic) => {
		if (err) {
			req.flash("error", "There was an error finding the topic.");
			return res.redirect("/forums");
		}
		req.body.forum.author = {
			id: req.user.id,
			username: req.user.username
		};
		Forum.create(req.body.forum, (err, createdForum) => {
			if (err) {
				req.flash("error", "There was an error creating the forum.");
				return res.redirect("/forums");
			}
			foundTopic.forums.push(createdForum.id);
			foundTopic.save((err, savedTopic) => {
				if (err) {
					req.flash("error", "There was an error saving the topic.");
					return res.redirect("/forums");
				}
				res.redirect("/forums");
			});
		});
	});
});

module.exports = forumRouter;

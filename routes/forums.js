const express = require("express");
const forumRouter = express.Router();
const Forum = require("../models/forum");
const Topic = require("../models/topic");
const middleware = require("../middleware");
const Post = require("../models/post");

// get all topics, populate their forums, render the index
forumRouter.get("/", (req, res) => {
	Topic.find({})
		.populate("forums")
		.exec((err, foundTopics) => {
			res.render("forums/index", { page: "forum", topics: foundTopics });
		});
});

// get the new forum form. Pass in topic ID for linking.
forumRouter.get("/new/:topic_id", middleware.isLoggedIn, (req, res) => {
	Topic.findById(req.params.topic_id, (err, foundTopic) => {
		if (!foundTopic) {
			req.flash("error", "No topic with that ID was found.");
			return res.redirect("/forums");
		}
		res.render("forums/new", { page: "forum", topicId: req.params.topic_id });
	});
});

// get a forum, populate its posts, render the forum show view.
forumRouter.get("/:forum_id", (req, res) => {
	const perPage = 10;
	const pageQuery = parseInt(req.query.page);
	const pageNumber = pageQuery ? pageQuery : 1;
	Forum.findById(req.params.forum_id)
		.populate({
			path: "posts",
			options: {
				sort: {
					lastActive: -1
				},
				skip: (perPage * pageNumber) - perPage,
				limit: perPage
			}
		})
		.exec((err, foundForum) => {
			if (!foundForum) {
				req.flash("error", "could not find forum.");
				return res.redirect("/forums");
			}
			Post.find().where("forum").equals(foundForum._id).count((err, count) => {
				if (err) {
					req.flash("error", "There was an error finding the post.");
					return res.redirect("/forums");
				}
				res.render("forums/show", {
					page: "forum",
					forum: foundForum,
					currentPage: pageNumber,
					pages: Math.ceil(count / perPage)
				});
			});
		});
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
		req.body.forum.topic = foundTopic.id;
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

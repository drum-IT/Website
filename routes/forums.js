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
		foundTopics.forEach(topic => {
			Forum.find()
				.where("topic")
				.equals(topic._id)
				.exec((err, foundForums) => {
					if (err) {
						req.flash("error", "there was an error finding the forums");
						return res.redirect("back");
					}
					eval(require("locus"));
					topic.forums = foundForums;
					topic.save();
				});
		});
		res.render("forums/index", { page: "forum", topics: foundTopics });
	});
});

forumRouter.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("forums/new", { page: "forum" });
});

forumRouter.get("/:forum_id", (req, res) => {
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

forumRouter.post("/", (req, res) => {
	const newForum = {
		title: req.body.title,
		description: req.body.description,
		author: { id: req.user.id, username: req.user.username },
		topic: "5abd73e00fd54746ef32828d"
	};
	Forum.create(newForum, (err, createdForum) => {
		if (err) {
			req.flash("error", "There was an error creating the forum.");
			return res.redirect("back");
		}
		console.log(createdForum);
		res.redirect(`/forums/${createdForum.id}`);
	});
});

module.exports = forumRouter;

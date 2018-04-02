const express = require("express");
const postRouter = express.Router();
const Post = require("../models/post");
const middleware = require("../middleware");
const Forum = require("../models/forum");
const Reply = require("../models/reply");

postRouter.get("/new/:forum_id", middleware.isLoggedIn, (req, res) => {
	Forum.findById(req.params.forum_id, (err, foundForum) => {
		if (err) {
			req.flash("error", "There was an error finding the forum.");
			return res.redirect("/forums");
		}
		if (!foundForum) {
			req.flash("error", "There was an error finding the forum.");
			return res.redirect("/forums");
		}
		res.render("posts/new", { page: "forum", forumId: foundForum.id });
	});
});

postRouter.get("/:post_id", (req, res) => {
	const perPage = 10;
	const pageQuery = parseInt(req.query.page);
	const replies = parseInt(req.query.replies);
	let pageNumber = pageQuery ? pageQuery : 1;
	if (replies) {
		const pages = Math.ceil(replies / perPage);
		pageNumber = pages;
		if (replies / pages > perPage) {
			pageNumber++;
		}
	}
	Post.findById(req.params.post_id)
		.populate({
			path: "replies",
			options: {
				sort: {
					createdAt: 1
				},
				skip: perPage * pageNumber - perPage,
				limit: perPage
			}
		})
		.populate("forum")
		.exec((err, foundPost) => {
			if (!foundPost) {
				req.flash("error", "could not find post.");
				return res.redirect("/forums");
			}
			Reply.find()
				.where("post")
				.equals(foundPost._id)
				.count((err, count) => {
					if (err) {
						req.flash("error", "There was an error finding the reply.");
						return res.redirect("/forums");
					}
					res.render("posts/show", {
						page: "forum",
						post: foundPost,
						forum: undefined,
						currentPage: pageNumber,
						replies: count,
						pages: Math.ceil(count / perPage)
					});
				});
		});
});

postRouter.post("/:forum_id", middleware.isLoggedIn, (req, res) => {
	Forum.findById(req.params.forum_id, (err, foundForum) => {
		if (err) {
			req.flash("error", "There was an error finding the forum.");
			return res.redirect("/forums");
		}
		if (!foundForum) {
			req.flash("error", "There was an error finding the forum.");
			return res.redirect("/forums");
		}
		req.body.post.author = {
			id: req.user.id,
			username: req.user.username
		};
		req.body.post.forum = foundForum.id;
		req.body.post.topic = foundForum.topic;
		Post.create(req.body.post, (err, createdPost) => {
			if (err) {
				req.flash("error", "There was an error creating the post.");
				return res.redirect("/forums");
			}
			foundForum.posts.push(createdPost.id);
			foundForum.lastActive = Date.now();
			foundForum.save((err, savedForum) => {
				if (err) {
					req.flash("error", "Error saving the forum");
					return res.redirect("/forums");
				}
				res.redirect("/posts/" + createdPost.id);
			});
		});
	});
});

module.exports = postRouter;

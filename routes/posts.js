const express = require("express");
const postRouter = express.Router();
const Post = require("../models/post");
const middleware = require("../middleware");
const Forum = require("../models/forum");

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
	res.send("This route will show a post.");
})

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
		Post.create(req.body.post, (err, createdPost) => {
			if (err) {
				req.flash("error", "There was an error creating the post.");
				return res.redirect("/forums");
			}
			foundForum.posts.push(createdPost.id);
			foundForum.lastPost = Date.now();
			foundForum.save((err, savedForum) => {
				if (err) {
					req.flash("error", "Error saving the forum");
					return res.redirect("/forums");
				}
				res.redirect("/forums/" + req.params.forum_id);
			});
		});
	});
});

module.exports = postRouter;

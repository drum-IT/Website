const express = require("express");
const postRouter = express.Router();
const Post = require("../models/post");
const middleware = require("../middleware");
const Forum = require("../models/forum");

postRouter.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("posts/new", { page: "forum" });
});

postRouter.post("/", middleware.isLoggedIn, (req, res) => {
	const newPost = {
		title: req.body.title,
		content: req.body.description,
		author: { id: req.user.id, username: req.user.username },
		forum: "5abd74963880a1470656dc82"
	};
	Post.create(newPost, (err, createdPost) => {
		if (err) {
			req.flash("error", "There was an error creating the post.");
			return res.redirect("back");
		}
		console.log(createdPost);
		res.redirect("/forums");
	});
});

module.exports = postRouter;

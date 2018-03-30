const express = require("express");
const topicRouter = express.Router();
const Topic = require("../models/topic");
const middleware = require("../middleware");

topicRouter.get("/new", middleware.isLoggedIn, (req, res) => {
	res.render("topics/new", { page: "forum" });
});

topicRouter.post("/", middleware.isLoggedIn, (req, res) => {
	const newTopic = {
		title: req.body.title,
		description: req.body.description,
		author: {
			id: req.user.id,
			username: req.user.username
		}
	};
	Topic.create(newTopic, (err, createdTopic) => {
		if (err) {
			req.flash("error", "There was an error creating the topic.");
			return res.redirect("back");
		}
		res.redirect("/forums");
	});
});

module.exports = topicRouter;

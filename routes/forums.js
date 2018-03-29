const express = require("express");
const forumRouter = express.Router();
const Forum = require("../models/forum");
const middleware = require("../middleware");

forumRouter.get("/", (req, res) => {
	res.render("forums/index", { page: "forum" });
});

forumRouter.get("/:forum_id", (req, res) => {
	res.render("forums/show", { page: "forum" });
});

module.exports = forumRouter;

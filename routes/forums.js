const express = require("express");
const forumRouter = express.Router();
const Forum = require("../models/forum");

forumRouter.get("/", (req, res) => {
	res.render("forums/index", { page: "forum" });
});

module.exports = forumRouter;

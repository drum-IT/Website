const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	title: String,
	content: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	forum: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Forum"
	}
});

module.exports = mongoose.model("Post", postSchema);

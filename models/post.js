const mongoose = require("mongoose");

const postSchema = new mongoose.Schema({
	title: String,
	content: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	topic: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Topic"
	},
	forum: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "Forum"
	},
	replies: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Reply"
		}
	]
});

module.exports = mongoose.model("Post", postSchema);

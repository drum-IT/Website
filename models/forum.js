const mongoose = require("mongoose");

const forumSchema = new mongoose.Schema({
	title: String,
	content: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		type: mongoose.Schema.Types.ObjectId,
		ref: "User"
	},
	replies: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Reply"
		}
	]
});

module.exports = mongoose.model("Forum", forumSchema);

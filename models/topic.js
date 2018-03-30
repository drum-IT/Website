const mongoose = require("mongoose");

const topicSchema = new mongoose.Schema({
	title: String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User"
		},
		username: String
	},
	forums: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: "Forum"
		}
	]
});

module.exports = mongoose.model("Topic", topicSchema);

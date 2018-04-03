const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
	title: String,
	description: String,
	createdAt: { type: Date, default: Date.now },
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User'
		},
		username: String
	},
	topic: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Topic'
	},
	posts: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Post'
		}
	],
	replies: { type: Number, default: 0 },
	lastActive: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Forum', forumSchema);

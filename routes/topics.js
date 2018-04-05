const express = require('express');
const middleware = require('../middleware');
const topicRouter = express.Router();
const Topic = require('../models/topic');

topicRouter.get('/new', middleware.isLoggedIn, (req, res) => {
	res.render('topics/new', { page: 'forum' });
});

topicRouter.post('/', middleware.isLoggedIn, (req, res) => {
	req.body.topic.author = {
		id: req.user.id,
		username: req.user.username
	};
	Topic.create(req.body.topic, err => {
		if (err) {
			req.flash('error', 'There was an error creating the topic.');
			return res.redirect('back');
		}
		res.redirect('/forums');
	});
});

module.exports = topicRouter;

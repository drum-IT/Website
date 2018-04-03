const express = require('express');
const replyRouter = express.Router();
const Post = require('../models/post');
const middleware = require('../middleware');
const Forum = require('../models/forum');
const Reply = require('../models/reply');

replyRouter.get('/new/:post_id', middleware.isLoggedIn, (req, res) => {
	Post.findById(req.params.post_id, (err, foundPost) => {
		if (err) {
			req.flash('error', 'There was an error finding the post.');
			return res.redirect('/forums');
		}
		if (!foundPost) {
			req.flash('error', 'Couldnt find the post!');
			return res.redirect('back');
		}
		res.render('replies/new', { page: 'forum', postId: foundPost.id });
	});
});

replyRouter.post('/:post_id', middleware.isLoggedIn, (req, res) => {
	Post.findById(req.params.post_id)
		.populate('forum')
		.exec((err, foundPost) => {
			if (err) {
				req.flash('error', 'There was an error finding the post.');
				return res.redirect('/posts/' + req.params.post_id);
			}
			if (!foundPost) {
				req.flash('error', 'There was an error finding the post.');
				return res.redirect('/posts/' + req.params.post_id);
			}
			req.body.reply.author = {
				id: req.user.id,
				username: req.user.username
			};
			req.body.reply.post = foundPost.id;
			req.body.reply.forum = foundPost.forum;
			req.body.reply.topic = foundPost.topic;
			Reply.create(req.body.reply, (err, createdReply) => {
				if (err) {
					req.flash(
						'error',
						'There was an error creating the reply.'
					);
					return res.redirect('/posts/' + req.params.post_id);
				}
				foundPost.replies.push(createdReply.id);
				foundPost.lastActive = Date.now();
				foundPost.save((err, savedPost) => {
					if (err) {
						req.flash('error', 'Error saving the post');
						return res.redirect('/forums');
					}
					Forum.findById(savedPost.forum, (err, foundForum) => {
						if (err) {
							req.flash('error', 'Error finding the forum');
							return res.redirect('/forums');
						}
						foundForum.replies++;
						foundForum.lastActive = Date.now();
						foundForum.save();
						Reply.find()
							.where('post')
							.equals(savedPost._id)
							.count((err, count) => {
								res.redirect(
									`/posts/${
										req.params.post_id
									}?replies=${count}`
								);
							});
					});
				});
			});
		});
});

replyRouter.post('/:reply_id/delete', (req, res) => {
	Reply.findById(req.params.reply_id, (err, foundReply) => {
		if (err || !foundReply) {
			req.flash('error', 'Error finding the reply');
			return res.redirect('/forums');
		}
		Post.findById(foundReply.post, (err, foundPost) => {
			if (err || !foundPost) {
				req.flash('error', 'Error finding the post');
				return res.redirect('/forums');
			}
			Forum.findById(foundPost.forum, (err, foundForum) => {
				if (err || !foundPost) {
					req.flash('error', 'Error finding the post');
					return res.redirect('/forums');
				}
				foundForum.replies--;
				foundForum.save();
				foundPost.replies.splice(
					foundPost.replies.indexOf(foundReply._id),
					1
				);
				foundPost.save((err, savedPost) => {
					foundReply.remove();
					res.redirect('/posts/' + savedPost.id);
				});
			});
		});
	});
});

module.exports = replyRouter;

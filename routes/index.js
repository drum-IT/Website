const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/user');
const nodemailer = require('nodemailer');
const async = require('async');
const crypto = require('crypto');
const middleware = require('../middleware');

// GET ROUTES
router.get('/', (req, res) => {
	res.render('landing', { page: 'landing' });
});

router.get('/about', middleware.isLoggedIn, (req, res) => {
	res.render('about', { page: 'about' });
});

// show the register form
router.get('/register', (req, res) => {
	res.render('register', { page: 'register' });
});

// show the login form
router.get('/login', (req, res) => {
	res.render('login', { page: 'login' });
});

// show the logout form
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'You have been logged out.');
	res.redirect('/');
});

router.get('/forgot', middleware.csrf, (req, res) => {
	res.render('forgot', { page: 'forgot', csrfToken: req.csrfToken() });
});

router.get('/reset/:token', (req, res) => {
	User.findOne(
		{
			resetPasswordToken: req.params.token,
			resetPasswordExpires: { $gt: Date.now() }
		},
		(err, user) => {
			if (!user) {
				req.flash(
					'error',
					'Password reset token is invalid or has expired.'
				);
				res.redirect('/forgot');
			} else {
				res.render('reset', { page: 'reset', token: req.params.token });
			}
		}
	);
});

// POST ROUTES
// create a new user, add them to the database, and authenticate them
router.post('/register', (req, res) => {
	const user = new User({
		username: req.body.username,
		email: req.body.email
	});
	if (req.body.adminCode === process.env.ADMIN_CODE) {
		user.isAdmin = true;
	}
	User.register(user, req.body.password, (err, newUser) => {
		if (err) {
			req.flash('error', err.message);
			return res.redirect('register');
		}
		passport.authenticate('local')(req, res, () => {
			req.flash('success', `Welcome to the site, ${newUser.username}!`);
			res.redirect('/');
		});
	});
});

// log a user in
router.post(
	'/login',
	passport.authenticate('local', {
		failureRedirect: '/login',
		failureFlash: true
	}),
	(req, res) => {
		req.flash('success', `Welcome back, ${req.user.username}!`);
		res.redirect('/');
	}
);

router.post('/forgot', middleware.csrf, async (req, res) => {
	async.waterfall(
		[
			done => {
				crypto.randomBytes(20, (err, buf) => {
					const token = buf.toString('hex');
					done(err, token);
				});
			},
			(token, done) => {
				User.findOne({ email: req.body.email }, (err, user) => {
					if (err) {
						req.flash(
							'error',
							'An error occurred while finding the user.'
						);
						res.redirect('back');
					} else if (!user) {
						req.flash(
							'error',
							'A user with that email address could not be found.'
						);
						res.redirect('back');
					} else {
						user.resetPasswordToken = token;
						user.resetPasswordExpires = Date.now() + 3600000;
						user.save(err => {
							done(err, token, user);
						});
					}
				});
			},
			(token, user, done) => {
				const sgMail = require('@sendgrid/mail');
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);
				const msg = {
					to: user.email,
					from: process.env.ADMIN_EMAIL,
					subject: 'Password Reset Request',
					text: 'and easy to do anywhere, even with Node.js',
					html:
						`<p>Hello ${user.username},</p>` +
						`<p>A password reset has been requested for your account.</p>` +
						`<p>If you did not request a password reset, please disregard this email.</p>` +
						`<p>Click below if you wish to reset your password.</p>` +
						`<a href="${process.env.HEADER}${
							req.headers.host
						}/reset/${token}">Reset Password</a>`
				};
				sgMail.send(msg);
				req.flash(
					'success',
					'Please check your email for password reset instructions.'
				);
				done('done');
			}
		],
		() => {
			res.redirect('/forgot');
		}
	);
});

router.post('/reset/:token', (req, res) => {
	async.waterfall(
		[
			done => {
				User.findOne(
					{
						resetPasswordToken: req.params.token,
						resetPasswordExpires: { $gt: Date.now() }
					},
					(err, user) => {
						if (err) {
							req.flash(
								'error',
								'There was an error finding the user.'
							);
							return res.redirect('/forgot');
						} else if (!user) {
							req.flash(
								'error',
								'Password reset token invalid or expired.'
							);
							return res.redirect('/forgot');
						} else if (req.body.password === req.body.confirm) {
							user.setPassword(req.body.password, err => {
								user.resetPasswordToken = undefined;
								user.resetPasswordExpires = undefined;
								user.save(err => {
									req.logIn(user, err => {
										done(err, user);
									});
								});
							});
						} else {
							req.flash('error', 'Passwords do not match.');
							return res.redirect('back');
						}
					}
				);
			},
			(user, done) => {
				const sgMail = require('@sendgrid/mail');
				sgMail.setApiKey(process.env.SENDGRID_API_KEY);
				const msg = {
					to: user.email,
					from: process.env.ADMIN_EMAIL,
					subject: 'Password Reset Confirmation',
					html:
						`<p>Hello ${user.username},</p>` +
						`<p>The password for your account has been changed.</p>`
				};
				sgMail.send(msg);
				req.flash('success', 'Your password has been reset.');
				done('done');
			}
		],
		() => {
			res.redirect('/');
		}
	);
});

module.exports = router;

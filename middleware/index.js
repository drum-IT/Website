const middleware = {};
const csurf = require("csurf");

middleware.isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}
	req.flash("error", "You must be logged in to do that.");
	res.redirect("/login");
};

middleware.csrf = csurf();

module.exports = middleware;

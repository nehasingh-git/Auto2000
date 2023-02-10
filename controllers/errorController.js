module.exports = (function () {
	// variables
	var retVal, seodata;

	// assign variables
	retVal = {};

	//Http request Functions   
	function notFound(req, res) {
		 

		res.render('error', {
			user: (req.session && req.session.user && req.session.IsLoggedIn) ? req.session.user : null,
			status: 404,
			message: "Sorry, we could not find the page you are looking for."
		});
	}

	function serverError(req, res) {

		res.render('error', {
			user: (req.session && req.session.user && req.session.IsLoggedIn) ? req.session.user : null,
			status: 500,
			message: "Technical Error Please try again later."
		});
	}


	function unAuthorize(req,res){
		res.render('error', {
			user: (req.session && req.session.user && req.session.IsLoggedIn) ? req.session.user : null,
			status: 401,
			message: "You are not authorized to view this resource."
		});
	}

	retVal.notFound = notFound;
	retVal.serverError = serverError;
	retVal.unAuthorize = unAuthorize;


	// return module
	return retVal;
})();
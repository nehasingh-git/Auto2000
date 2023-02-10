module.exports = (function () {
	// variables
	var retVal;
	// assign variables
	retVal = {};
	fs = require("fs");
	handlebars = require('handlebars');
	handlebarshelper = require('./../helpers/handlebars-helpers');
	fileHelper= require('./../helpers/fileHelper');
	handlebars.registerHelper(handlebarshelper);
	constants = require('../constants');
	//Http request Functions   

	function getPricing(req, res) {
		try {
			var regNo = req.params.regNo;
			 console.log(regNo)
			allPricing = fileHelper.readFile("pricing.json", "pricing");
			console.log(allPricing)
			res.render('appointment', {
				pricing: allPricing,
				layout: "layoutSite"
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};
 

	retVal.pricing = getPricing;
	
	// return module
	return retVal;
})();
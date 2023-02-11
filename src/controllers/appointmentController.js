module.exports = (function () {
	// variables
	var retVal;
	// assign variables
	retVal = {};
	fs = require("fs");
	handlebars = require('handlebars');
	handlebarshelper = require('./../helpers/handlebars-helpers');
	fileHelper = require('./../helpers/fileHelper');
	handlebars.registerHelper(handlebarshelper);
	constants = require('../constants');
	//Http request Functions   

	function index(req, res) {
		try {

			res.render('index', {
				layout: "layoutSite"
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};

	function contact(req, res) {
		try {

			res.render('contact', {
				layout: "layoutSite"
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};

	function getPricing(req, res) {
		try {
			var regNo = req.params.regNo;
			allPricing = fileHelper.readFile("pricing.json", "pricing");
			let dataData = {};
			if (allPricing && allPricing.data) {
				
				//data = allPricing.data.find(o => o.key === regNo);
				var obj = allPricing.data;
				dataData = obj.find(e => e.id == '987');
				res.render('appointment', {
					pricing: dataData,
					layout: "layoutSite"
				});
				 
			}
			
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};

	retVal.index = index;
	retVal.contact = contact;
	retVal.pricing = getPricing;
	// return module
	return retVal;
})();
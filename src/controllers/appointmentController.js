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
				var obj = allPricing.data;
				dataData = obj.find(e => e.id == regNo);
			}

			res.render('appointment', {
				pricingData: dataData,
				layout: "layoutSite"
			});

		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};

	function appointment(req, res) {
		try {
			var name = req.body.name;
			var phone = req.body.phone;

			var response = responseInit(true, "Success.", {"message":"we have ack your request, our team will contact you soon"});
			res.status(200).json(response);

		} catch (error) {
			var response = responseInit(false, 'Error while adding/updating new contest.');
			res.status(500).json(response);
		}
	}

	function responseInit(success, message, data) {
		var response;
		response = {
			success: false,
			data: {},
			message: ''
		};

		response.success = success;
		response.data = data;
		response.message = message;

		return response;
	}

	retVal.index = index;
	retVal.contact = contact;
	retVal.pricing = getPricing;
	retVal.appointment = appointment;
	// return module
	return retVal;
})();
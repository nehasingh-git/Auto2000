
module.exports = (function () {
	// variables
	var retVal;
	// assign variables
	retVal = {};
	fs = require("fs");
	handlebars = require('handlebars');
	handlebarshelper = require('./../helpers/handlebars-helpers');
	fileHelper = require('./../helpers/fileHelper');
	emailHelper = require('./../helpers/emailHelper');
	handlebars.registerHelper(handlebarshelper);
	constants = require('../constants');
	const nodemailer = require("nodemailer");
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

	function appointmentGet(req, res) {
		try {
			var regNo = req.params.regNo;
			allPricing = fileHelper.readFile("pricing.json", "pricing");
			let dataData = {};
			if (allPricing && allPricing.data) {
				var obj = allPricing.data;
				dataData = obj.find(e => e.id == regNo);
			}

			res.render('appointment', {
				regNo: regNo,
				data: dataData,
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
			data = {
				name: req.body.name,
				phone: req.body.phone,
				email: req.body.email,
				appointmentDate: req.body.appointmentDate,
				appointmentTime: req.body.appointmentTime,
				regNo: req.body.regNo,
				services: JSON.parse(req.body.serviceArray)
			};
			emailHelper.appointmentConfirmation(data);
			emailHelper.appointmentRequest(data);
			var response = responseInit(true, "Success.", { "message": "we have ack your request, our team will contact you soon" });
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
	retVal.appointmentGet = appointmentGet;
	retVal.appointment = appointment;
	// return module
	return retVal;
})();
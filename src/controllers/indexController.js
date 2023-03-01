const e = require("cors");
const { response } = require("express");

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
	const axios = require('axios');
	//Http request Functions   

	function index(req, res) {
		try {
			allPricing = fileHelper.readFile("pricing.json", "index");
			let data = {};
			if (allPricing && allPricing.data) {
				data = allPricing.data.map(function (item) { return { "id": item["id"], name: item["id"] } });
			}
			res.render('index', {
				isHome: true,
				data: data,
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

	function contactPost(req, res) {
		try {
			data = {
				name: req.body.name,
				message: req.body.message,
				email: req.body.email
			};
			emailHelper.contactTeam(data);
			var response = responseInit(true, "Success.", { "message": "we have acknowledged your request, our team will contact you soon" });
			res.status(200).json(response);

		} catch (error) {
			console.log(error)
			var response = responseInit(false, "Server Error.", { "message": "Server Error , Please try after some time" });
			res.status(500).json(response);
		}
	}

	function callBackViaMobile(req, res) {
		try {
			var phone = req.params.phone;
			var data = { phone: phone }
			emailHelper.callBackViaMobile(data);
			var response = responseInit(true, "Success.", { "message": "we have acknowledged your request, our team will contact you soon" });
			res.status(200).json(response);

		} catch (error) {
			console.log(error)
			var response = responseInit(false, "Server Error.", { "message": "Server Error , Please try after some time" });
			res.status(500).json(response);
		}
	}

	function services(req, res) {
		try {
			services = fileHelper.readFile("services.json", "index");
			res.render('services', {
				data: services,
				layout: "layoutSite"
			});

		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};

	async function appointmentGet(req, res) {
		try {
			var regNo = req.params.regNo;
			var model = req.params.model;
			//test(regNo)
			allPricing = fileHelper.readFile("pricing.json", "index");
			let data = {};
			if (allPricing && allPricing.data) {
				var obj = allPricing.data;
				data = obj.find(e => e.id == model);
			}
			let vehicleData = await getMotData(regNo, res)
			if (vehicleData) {
				console.log(vehicleData.data)
			}
			else {
				console.log("error");
			}


			res.render('appointment', {
				regNo: regNo,
				data: data,
				make: vehicleData && vehicleData.data ? vehicleData.data.make : '',
				motExpiryDate: vehicleData && vehicleData.data ? vehicleData.data.motExpiryDate : '',
				layout: "layoutSite"
			});


		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};


	async function getMotData(regNo) {
		try {
			var data = JSON.stringify({ registrationNumber: regNo });
			var config = {
				method: 'post',
				url:
					'https://driver-vehicle-licensing.api.gov.uk/vehicle-enquiry/v1/vehicles',
				headers: {
					'x-api-key': 'p8RCmO5r2l1JwiHIdbjao9In8f6uRltP6C1jEIfR',
					'Content-Type': 'application/json',
				},
				data: data,
			};

			return await axios(config)
		}
		catch (error) {
			var error1 = error.message + ' Exception in retreving getMotDate for registration:';
			console.log(error1)
			return "";
		}
	}


	async function test(req, res) {
		var regNo = req.params.regNo;
		let ret = await getMotData(regNo)
		if (ret) {
			if (ret && ret.data)
				res.end("success--- " + res.data);
			else {
				res.end("success")
			}
		}
		else {
			res.end("Could not fetch result");
		}
	}


	function appointment(req, res) {
		try {
			var services = JSON.parse(req.body.serviceArray);
			var serviceType = services.find(x => x.type == 'minorService' || x.type == 'majorService')

			console.log(serviceType)
			var addOnServices = services.filter(x => x.type == 'addOnService')
			var otherModifications = services.filter(x => x.type == 'otherModification')
			var pickupDropService = services.find(x => x.type == 'pickupDropService');
			data = {
				name: req.body.name,
				phone: req.body.phone,
				email: req.body.email,
				appointmentDate: req.body.appointmentDate,
				appointmentTime: req.body.appointmentTime,
				regNo: req.body.regNo,
				serviceType: serviceType,
				model: req.body.makeAndModel,
				addOnServices: addOnServices,
				otherModifications: otherModifications,
				pickupDropService: pickupDropService,
				orderTotal: services.reduce((a, b) => +a + +b.cost, 0)
			};

			emailHelper.appointmentConfirmation(data);
			emailHelper.appointmentRequest(data);
			var response = responseInit(true, "Success.", { "message": "we have acknowledged your request, our team will contact you soon" });
			res.status(200).json(response);

		} catch (error) {
			console.log(error)
			var response = responseInit(false, "Server Error.", { "message": "Server Error , Please try after some time" });
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
	retVal.services = services;
	retVal.contactPost = contactPost;
	retVal.callBackViaMobile = callBackViaMobile;
	retVal.getMotDate = test;
	// return module
	return retVal;
})();
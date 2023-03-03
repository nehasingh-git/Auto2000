const { json } = require("body-parser");
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
	function FormatData(dataRow) {
		return data = {
			"id": dataRow.id,
			"name": dataRow.name,
			"minor_service": {
				"id": dataRow.minorData_id,
				"type": dataRow.minorData_type,
				"name": dataRow.minorData_name,
				"icon": dataRow.minorData_icon,
				"cost": dataRow.minorData_cost,
				"description": dataRow.minorData_description,
			},
			"major_service": {
				"id": dataRow.majorData_id,
				"type": dataRow.majorData_type,
				"name": dataRow.majorData_name,
				"icon": dataRow.majorData_icon,
				"cost": dataRow.majorData_cost,
				"description": dataRow.majorData_description,
			}, add_on_services: [
				{
					"id": dataRow.air_conditioning_service_data_id,
					"icon": dataRow.air_conditioning_service_data_icon,
					"name": dataRow.air_conditioning_service_data_name,
					"cost": dataRow.air_conditioning_service_data_cost
				},
				{
					"id": dataRow.air_conditioning_radiator_replacement_id,
					"icon": dataRow.air_conditioning_radiator_replacement_icon,
					"name": dataRow.air_conditioning_radiator_replacement_name,
					"cost": dataRow.air_conditioning_radiator_replacement_cost
				},
				{
					"id": dataRow.brake_fluid_change_id,
					"icon": dataRow.brake_fluid_change_icon,
					"name": dataRow.brake_fluid_change_name,
					"cost": dataRow.brake_fluid_change_cost
				},
				{
					"id": dataRow["brake_pad_&_disc_front_or_rear_id"],
					"icon": dataRow["brake_pad_&_disc_front_or_rear_icon"],
					"name": dataRow["brake_pad_&_disc_front_or_rear_name"],
					"cost": dataRow["brake_pad_&_disc_front_or_rear_cost"]
				},
				{
					"id": dataRow["brake_pad_&_disc_front_id"],
					"icon": dataRow["brake_pad_&_disc_front_icon"],
					"name": dataRow["brake_pad_&_disc_front_name"],
					"cost": dataRow["brake_pad_&_disc_front_cost"]
				},
				{
					"id": dataRow.clutch_oil_change_id,
					"icon": dataRow.clutch_oil_change_icon,
					"name": dataRow.clutch_oil_change_name,
					"cost": dataRow.clutch_oil_change_cost
				},
				{
					"id": dataRow.clutch_replacement_id,
					"icon": dataRow.clutch_replacement_icon,
					"name": dataRow.clutch_replacement_name,
					"cost": dataRow.clutch_replacement_cost
				},
				{
					"id": dataRow.cam_belt_replacement_id,
					"icon": dataRow.cam_belt_replacement_icon,
					"name": dataRow.cam_belt_replacement_name,
					"cost": dataRow.cam_belt_replacement_cost
				},
				{
					"id": dataRow.drive_belt_replacement_id,
					"icon": dataRow.drive_belt_replacement_icon,
					"name": dataRow.drive_belt_replacement_name,
					"cost": dataRow.drive_belt_replacement_cost
				},
				{
					"id": dataRow.water_pump_replacement_id,
					"icon": dataRow.water_pump_replacement_icon,
					"name": dataRow.water_pump_replacement_name,
					"cost": dataRow.water_pump_replacement_cost
				},
				{
					"id": dataRow.wheel_alignment_id,
					"icon": dataRow.wheel_alignment_icon,
					"name": dataRow.wheel_alignment_name,
					"cost": dataRow.wheel_alignment_cost
				},
				{
					"id": dataRow.vehicle_mot_id,
					"icon": dataRow.vehicle_mot_icon,
					"name": dataRow.vehicle_mot_name,
					"cost": dataRow.vehicle_mot_cost
				}

			],

			other_modification: [
				{
					"id": dataRow.ims_upgrades_id,
					"icon": dataRow.ims_upgrades_icon,
					"name": dataRow.ims_upgrades_name,
					"cost": dataRow.ims_upgrades_cost
				},
				{
					"id": dataRow.rms_upgrades_id,
					"icon": dataRow.rms_upgrades_icon,
					"name": dataRow.rms_upgrades_name,
					"cost": dataRow.rms_upgrades_cost
				},
				{
					"id": dataRow.engine_rebuilds_id,
					"icon": dataRow.engine_rebuilds_icon,
					"name": dataRow.engine_rebuilds_name,
					"cost": dataRow.engine_rebuilds_cost
				},
				{
					"id": dataRow.exhaust_upgrades_dansk_id,
					"icon": dataRow.exhaust_upgrades_dansk_icon,
					"name": dataRow.exhaust_upgrades_dansk_name,
					"cost": dataRow.exhaust_upgrades_dansk_cost
				},
				{
					"id": dataRow.replacement_roof_fitted_with_glass_id,
					"icon": dataRow.replacement_roof_fitted_with_glass_icon,
					"name": dataRow.replacement_roof_fitted_with_glass_name,
					"cost": dataRow.replacement_roof_fitted_with_glass_cost
				},
			]
		}

	}
	function index(req, res) {
		try {

			// test = fileHelper.readFile("test.json", "index");
			// let finalre = [];
			// for (var i = 0; i < test.data.length; i++) {
			// 	let row = test.data[i];
			// 	finalre.push(FormatData(row))
			// }
			// console.log(JSON.stringify(finalre))

			allPricing = fileHelper.readFile("pricing.json", "index");
			let data = {};
			if (allPricing && allPricing.data) {
				data = allPricing.data.map(function (item) { return { "id": item["id"], name: item["name"] } });
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

				data.add_on_services = data.add_on_services.filter(function (item) {
					return item.cost != 0;
				});
				data.other_modification = data.other_modification.filter(function (item) {
					return item.cost != 0;
				});
			}




			console.log(data)
			let vehicleData = await getMotData(regNo, res)

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


	async function getMot(req, res) {
		var regNo = req.params.regNo;
		let ret = await getMotData(regNo);
		let vehicleData = await getMotData(regNo, res)
		if (!vehicleData) {
			res.send({ "status": false, "message": "Server error please try after sometime." })
		}
		else if (vehicleData && vehicleData.errors) {
			var code = vehicleData.errors[0].code;
			if (code == 404) {
				res.send({ "status": false, "message": "Could not found vehicle for the given registration number." })
			}
			else if (code == 400) {
				res.send({ "status": false, "message": "Invalid vehicle registration number." })
			}
			else if (code == 500) {
				res.send({ "status": false, "message": "Server error in retrving vehicle." })
			}
			else if (code == 500) {
				res.send({ "status": false, "message": "Please try after sometime." })
			}
			else {
				res.send({ "status": false, "message": "Server error please try after sometime." })
			}
		}
		else {
			return res.send({ "status": true, "message": "success" })
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

			let cost = 0;
			let isPoa = false;
			for (var i = 0; i < services.length; i++) {

				if (services[i].cost == 'P/O/A') {
					isPoa = true;
				} else {
					cost += parseInt(services[i].cost, 10);
				}


				//serviceArray.reduce((a, b) => +a + +b.cost, 0);
			}
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
				orderTotal: cost + "" + (isPoa ? "+ P/O/A" : "")
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
	retVal.getMot = getMot;
	// return module
	return retVal;
})();
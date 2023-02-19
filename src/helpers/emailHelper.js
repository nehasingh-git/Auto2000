module.exports = (function () {
    // variables
    var retVal, nodemailerpath, fs, handlebars, config, dateHelper;
    config = require('../config.json');
    path = require('path');
    fs = require("fs");
    handlebars = require('handlebars');
    //dateHelper = require('../helpers/dateHelper');
    // assign variables

    // 'wjjuykiaqfccftd'
    retVal = {};

    var nodemailer = require('nodemailer');

    var gmailOptions = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        auth: {

            user: 'porscherepairsuk@gmail.com',
            pass: 'rxymgmnzhnzdkjbd'
        }
    }
    var mailer = nodemailer.createTransport(gmailOptions);

    function appointmentConfirmation(data) {
        try {
            var programTabPath = path.join(__dirname, '..//views//email//', 'appointmentConfirmation.handlebars');
            var template = fs.readFileSync(programTabPath, "utf8");
            var compiledTemplate = handlebars.compile(template);
            var email = {
                to: data.email,
                from: 'Porscherepairsuk@gmail.com',
                subject: 'Appointment confirmation',
                text: 'sample data',
                html: compiledTemplate({
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    appointmentDate: data.appointmentDate,
                    appointmentTime: data.appointmentTime,
                    regNo: data.regNo,
                    model:data.model,
                    services: data.services,
                    serviceType: data.serviceType,
                    addOnServices: data.addOnServices,
                    otherModifications: data.otherModifications,
                    pickupDropService: data.pickupDropService,
                    orderTotal: data.orderTotal
                })
            };
            mailer.sendMail(email, function (err) {
                if (!err) {
                    console.log('appointment confirmation mail sent.')
                } else {
                    console.log(err.message)
                }
            });

        } catch (error) {
            console.log(error)
            console.log('exception while sending appointment confirmation mail.')
        }
    }

    function appointmentRequest(data) {
        try {
            var programTabPath = path.join(__dirname, '..//views//email//', 'appointmentRequest.handlebars');
            var template = fs.readFileSync(programTabPath, "utf8");
            var compiledTemplate = handlebars.compile(template);
            var email = {
                to: 'porscherepairsuk@gmail.com',
                from: 'Porscherepairsuk@gmail.com',
                subject: 'Appointment request',
                text: 'sample data',
                html: compiledTemplate({
                    name: data.name,
                    phone: data.phone,
                    email: data.email,
                    appointmentDate: data.appointmentDate,
                    appointmentTime: data.appointmentTime,
                    regNo: data.regNo,
                    model:data.model,
                    services: data.services,
                    serviceType: data.serviceType,
                    addOnServices: data.addOnServices,
                    otherModifications: data.otherModifications,
                    pickupDropService: data.pickupDropService,
                    orderTotal: data.orderTotal
                })
            };
            mailer.sendMail(email, function (err) {
                if (!err) {
                    console.log('appointment request mail sent.')
                } else {
                    console.log(err.message)
                }
            });

        } catch (error) {
            console.log('exception while sending appointment request mail.')
        }
    }

    retVal.appointmentConfirmation = appointmentConfirmation;
    retVal.appointmentRequest = appointmentRequest;
    // return module
    return retVal;
})();
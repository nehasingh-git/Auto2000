module.exports = (function () {
    // variables
    var retVal, nodemailerpath, fs, handlebars, config, dateHelper;
    config = require('../config.json');
    path = require('path');
    fs = require("fs");
    handlebars = require('handlebars');
    dateHelper = require('../helpers/dateHelper');
    config = require("../config.json");
    // assign variables
    retVal = {};

    var nodemailer = require('nodemailer');

    var gmailOptions = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        auth: {
            type: 'OAuth2',
            user: 'sumeet.malik@pepcoding.com',
            pass: 'vpbhknejnnivdehf',
            serviceClient: config.googleAuthPep.client_id,
            privateKey: config.googleAuthPep.private_key
        }
    }




    var mailer = nodemailer.createTransport(gmailOptions);

    function sendCreateAppointment(req, data, success, failure) {
        try {
            var user = req.session.user;

            var programTabPath = path.join(__dirname, '..//views//email//', 'gjp.handlebars');
            var template = fs.readFileSync(programTabPath, "utf8");
            var compiledTemplate = handlebars.compile(template);

            var subject = ((data.paymentStatus && data.paymentStatus) == false) ? " tried to apply for " : " applied for ";

            var email = {
                to: 'contact@pepcoding.com',
                from: '"PepCoding" <no-reply@pepcoding.com>',
                subject: user.name + subject + " " + data.course,
                text: user.name + subject + " " + data.course,
                html: compiledTemplate({
                    user: user,
                    data: data
                })
            };
            mailer.sendMail(email, function (err, res) {
                if (!err) {
                    success();
                } else {
                    console.log(err.message)
                    failure();
                }
            });

        } catch (error) {
            failure();
        }
    }

    function sendCreateAppointment(req, data, success, failure) {
        try {
            var user = req.session.user;
            var programTabPath = path.join(__dirname, '..//views//email//', 'orderSuccessMail.handlebars');
            var template = fs.readFileSync(programTabPath, "utf8");
            var compiledTemplate = handlebars.compile(template);

            var email = {
                to: user.email,
                from: '"PepCoding" <no-reply@pepcoding.com>',
                subject: 'Order Confirmation',
                text: 'We have received your order .',
                html: compiledTemplate({
                    user: user,
                    data: data,
                })
            };

            mailer.sendMail(email, function (err, res) {
                if (!err) {
                    success();
                } else {
                    console.log(err.message)
                    failure();
                }
            });

        } catch (error) {
            failure();
        }
    }

    retVal.sendAppointmentSuccess = sendAppointmentSuccess;
    retVal.sendCreateAppointment= sendCreateAppointment;
    // return module
    return retVal;
})();
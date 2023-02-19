module.exports = (function () {
    // variables
    var retVal, nodemailerpath, fs, handlebars, config, dateHelper;
    config = require('../config.json');
    path = require('path');
    fs = require("fs");
    handlebars = require('handlebars');
    //dateHelper = require('../helpers/dateHelper');
    // assign variables
    retVal = {};

    var nodemailer = require('nodemailer');

    var gmailOptions = {
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 465,
        secure: false,
        auth: {
            
            user: 'nehasingh.apr12@gmail.com',
            pass: 'gatqlwuyxzgdewws'
        }
    }
    var mailer = nodemailer.createTransport(gmailOptions);


    function appointmentConfirmation1() {
        let mailTransporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'nehasingh.apr12@gmail.com',
                pass: 'gatqlwuyxzgdewws'
            }
        });

        let mailDetails = {
            from: 'Porscherepairsuk@gmail.com',
            to: 'nehasingh.apr12@gmail.com',
            subject: 'Test mail',
            text: 'Node.js testing mail for GeeksforGeeks'
        };

        mailTransporter.sendMail(mailDetails, function (err, data) {
            if (err) {
                console.log('Error Occurs' + err);
            } else {
                console.log('Email sent successfully');
            }
        });
    }



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
                    services: data.services
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
                    services: data.services
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
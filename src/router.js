
module.exports = (function () {
  // variables
  var appointmentController;

  // assign variables


  appointmentController = require('./controllers/appointmentController');
errorController = require('./controllers/errorController'); 
  express = require('express');
  // // authorize = require("./middleware/authorisation");
  // redirect = require("./middleware/redirect");
  constants = require("./constants");
  roles = constants.roles;

  router = express.Router();

  //map routes for index controller  
  router.route('/').get(appointmentController.index);
  router.route('/contact').get(appointmentController.contact);
  router.route('/appointment/:regNo').get(appointmentController.pricing);
  router.route('/403').get(errorController.unAuthorize);
  router.route('/404').get(errorController.notFound);
  router.route('/serverError').get(errorController.serverError);

  // for handling undefined routes
  router.use(function (req, res, next) {
    //  res.sendStatus(404);
    res.status(404).redirect('/404');

  })
  return router;
})();
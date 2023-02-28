
module.exports = (function () {
  // variables
  var indexController;

  // assign variables


  indexController = require('./controllers/indexController');
  errorController = require('./controllers/errorController');
  express = require('express');
  // // authorize = require("./middleware/authorisation");
  // redirect = require("./middleware/redirect");
  constants = require("./constants");
  roles = constants.roles;

  router = express.Router();

  //map routes for index controller  
  router.route('/').get(indexController.index);
  router.route('/contact').get(indexController.contact);
  router.route('/contact').post(indexController.contactPost);
  router.route('/callback/:phone').post(indexController.callBackViaMobile)
  router.route('/services').get(indexController.services);
  router.route('/appointment/:regNo/:model').get(indexController.appointmentGet);
  router.route('/appointment').post(indexController.appointment);
  router.route('/getMotDate/:regNo').get(indexController.getMotDate);
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
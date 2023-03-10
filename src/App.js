// variables
var express = require('express');
var exphbs = require('express-handlebars');
var http = require('http');
var bp = require("body-parser");
var expressValidator = require('express-validator');
var path = require('path');
var router = require('./router');
var partialResponse = require('express-partial-response');
const https = require('https');


// creating app and server
var app = express();
var httpServer = http.Server(app);
var httpsServer =https.Server(app);
const oneHour       = 3600000;    // 3600000msec == 1hour


app.engine('.handlebars', exphbs.engine({
	defaultLayout: 'layoutSite',
	extname: '.handlebars',
	layoutsDir: path.join(__dirname, 'views/layouts'),
	helpers: require('./helpers/handlebars-helpers'),
	partialsDir: path.join(__dirname + '/views/partials')
}));

app.set('view engine', '.handlebars');
app.set('views', path.join(__dirname, 'views'));

app.use(partialResponse());

var publicDirPath =path.join(__dirname, "../");
app.use(express.static(publicDirPath + '/public', { maxAge: oneHour }));
 

app.use(express.static(publicDirPath, {
	dotfiles: 'allow'
}));

app.use(bp.urlencoded({
	 limit: '1000mb',
	extended: true
}));
app.use(bp.json( {limit: '1000mb', extended: true}));

app.use(express.json());       
app.use(express.urlencoded({extended: true})); 
// Global Vars
app.use(function (req, res, next) {

	next();
});





//set routes
app.use('/', router);


app.use(function (err, req, res, next) {
	console.error("server error : " + err.stack)
	res.status(500).send('sever error!')
})

app.listen(8080, () => {
  
	console.log(`App listening on port 8080`);
  });

// // starting server
// httpsServer.listen(443, httpServerConnected);
 
 
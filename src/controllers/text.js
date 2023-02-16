module.exports = (function () {
	// variables
	var retVal, request, jwt, config, user, emailService, seodata, pwdGenerator, axios, profileService;

	// assign variables
	retVal = {};
	config = require('../config.json');
	request = require("../services/request");
	user = require('../models/user');
	jwt = require('jsonwebtoken');
	const googleCredentials = config.googleAuth;
	const GOOGLE_CLIENT_ID = googleCredentials.client_id;
	const auth = require("../services/authService");
	isShowRegister = false;
	constant = require("../constants");
	statusCode = constants.statusCode;
	emailService = require('../services/emailService');
	otpService = require("../services/otpService");
	axios = require("axios");
	profileService = require("../services/profileService")

	pwdGenerator = require('generate-password');
	const {
		OAuth2Client
	} = require('google-auth-library');
	var client = new OAuth2Client(GOOGLE_CLIENT_ID, googleCredentials.client_secret, '/');

	//Http request Functions   
	function login(req, res) {
		try {
			if (req.session.IsLoggedIn)
				res.redirect("/index");
			else {
				renderLoginPage(req, res, false);
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};

	function renderLoginPage(req, res, isShowRegister, errors, isResendEmail, user) {
		try {
			if (!seodata)
				seodata = fileHelper.readFile("site.json", "seo");

			var referer = req.header('Referer') ? req.header('Referer') : '';
			res.query = referer;

			res.render('login', {
				isShowRegister: isShowRegister,
				errors: errors && errors.length > 0 ? errors : '',
				seodata: seodata.login,
				pageToRedirect: referer,
				errorsMessage: errors ? errors : '',
				isResendEmail: isResendEmail,
				userId: user ? user.userId : '',
				userName: user ? user.name : '',
				email: user ? user.email : ''
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function loginPost(req, res) {
		request.post('/auth', {
			email: req.body.email,
			password: req.body.password
		}, req, function (data) {
			var pageToRedirect = req.body.pageToRedirect;
			onAuthSuccess(req, res, data, pageToRedirect);

		}, function (error) {
			onAuthFalied(req, res, error)
		});
	}

	let page = {
		'student': '/studentSection',
		'college': '/collegeSection',
		'recruiter': '/recruiterSection'
	}

	function cookieRedirect(req, res, next) {
		let userType = req.cookies.userType;
		if (userType) {
			res.redirect(page[userType]);
		}
		else {
			next();
		}
	}

	function setCookie(req, res, next) {
		let userType = req.params.userType;
		res.cookie('userType', userType);
		res.redirect(page[userType]);
	}

	function clearCookie(req, res) {
		req.cookies.userType = undefined;
		res.clearCookie('userType');
		res.redirect("/");
	}

	function onAuthSuccess(req, res, data, pageToRedirect) {
		try {
			var loginType = req.body.loginType;
			var token = data.token;
			var theme = data.preferredTheme ? data.preferredTheme : config.defaultThemeName;
			jwt.verify(token, config.secret, function (err, user) {

				if (user && user.isActive) {
					req.session.token = user.token;
					req.session.user = user;

					req.session.IsLoggedIn = true;
					res.cookie('sessionId', user.sessionId, {
						maxAge: 24 * 60 * 60 * 1000,
						domain: 'pepcoding.com'
					});
					res.cookie('email', user.email, {
						maxAge: 24 * 60 * 60 * 1000,
						domain: 'pepcoding.com'
					});
					res.cookie('role', user.role, {
						maxAge: 24 * 60 * 60 * 1000,
						domain: 'pepcoding.com'
					});

					res.cookie('userId', user.userId, {
						maxAge: 24 * 60 * 60 * 1000,
						domain: 'pepcoding.com'
					});

					res.cookie('theme', theme, {
						maxAge: 365 * 24 * 60 * 60 * 1000,
						domain: 'pepcoding.com'
					});

					if (loginType == "popup") {
						profileService.profile(
							req,
							function (profile) {
								// console.log(profile)
								let data = {
									phone: user.phone,
									isPhoneVerified: profile.isPhoneVerified,
									yop: profile.yop,
									email: user.email
								}
								var response = responseInit(true, "Success.", data);
								res.status(200).json(response);
							},
							function (error, statusCode) {
								handleErrors(res, error, 500);
							}
						);

					}
					else {
						res.redirect(req.session.redirect ? req.session.redirect : (pageToRedirect ? pageToRedirect : '/'))
					}
				} else {
					var message = constant.emailMessages.activate ? constant.emailMessages.activate : '';
					req.session.token = undefined;
					req.session.user = undefined;
					req.session.IsLoggedIn = false;
					if (loginType == "popup") {
						var template = `<div id="errorMessage"
						class="alert alert-danger {{#ifCond isResendEmail '==' true}}  {{else}} red-text {{/ifCond}} {{#unless errorsMessage  }} hide{{errorsMessage}} {{/unless}}">
						{{errorsMessage}}
						{{#ifCond isResendEmail '==' true}}
						<input type="hidden" value="{{userId}}" id="userId">
						<input type="hidden" value="{{userName}}" id="userName">
						<input type="hidden" value="{{email}}" id="email">
						<input type="hidden" value="{{id}}" id="id">
						<a href="#" onclick="resendActivationLink();" class="blue-text text-underline">Resend
							Activation
							Link</a>
						{{/ifCond}}
						</div>`
						var compiledTemplate = handlebars.compile(template);
						var data = compiledTemplate({
							isResendEmail: true,
							errorsMessage: message,
							userId:user.userId,
							userName:user.name,
							email:user.email
						})
						var response = responseInit(false, "Failure.", data);
						res.status(500).json(response);
					}
					else
						renderLoginPage(req, res, false, message, true, user);
				}
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function resendActivationLink(req, res) {
		try {
			var userName = req.body.userName;
			var email = req.body.email;
			var userId = req.body.userId;
			if (userName && userId && email) {
				emailService.sendAccountActivation(req, res, email, userName, userId, function () {
					return res.render('login', {
						sendMailSuccessMsg: constant.emailMessages.checkmail ? constant.emailMessages.checkmail : '',
					});
				}, function () {
					return res.render('login', {
						sendMailSuccessMsg: constant.emailMessages.error ? constant.emailMessages.error : 'error'
					});
				});
			} else {
				console.log("some fields are missing");
				res.sendStatus(500).end(JSON.stringify({
					error: "Internal server error"
				}))
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function loginPostSocial(req, res) {

		try {
			var googleToken = req.body.token;
			user.Init(req.body.user, constant.roles.guest, 1);

			try {
				user.password = pwdGenerator.generate({
					length: 10,
					numbers: true
				});
			} catch (error) {
				console.error(error);
				user.password = 'pick#any$'
			}

			if (googleToken) {
				request.post('/getUserIfExist', user, req, function (response) {
					if (response && response.success) {
						onGoogleAuthSuccess(req, res, response, user.image);
						res.end('{"status" : 200}');
					} else {
						request.post('/register', user, req, function (data) {
							if (data.success == true) {
								request.post('/auth', {
									email: user.email,
									password: user.password
								}, req, function (data) {
									onGoogleAuthSuccess(req, res, data, user.image);
									res.end('{"status" : 200}');
								}, function (error) {
									onAuthFalied(req, res, error)
								});
							} else {
								console.log("error in registering user " + user.email);
							}
						}, function (data) {
							onAuthFalied(req, res, "error in registering user, please try later")
						});
					}
				}, function (error) {
					console.error(error);
					res.redirect('/login')
				});
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function onGoogleAuthSuccess(req, res, data, image) {
		try {
			var token = data.token;
			jwt.verify(token, config.secret, function (err, user) {

				req.session.token = user.token;
				req.session.user = user;
				req.session.IsLoggedIn = true;
				res.cookie('sessionId', user.sessionId, {
					domain: 'pepcoding.com',
					maxAge: 24 * 60 * 60 * 1000
				});
				res.cookie('userId', user.userId, {
					domain: 'pepcoding.com',
					maxAge: 900000
				});
				res.cookie('role', user.role, {
					domain: 'pepcoding.com',
					maxAge: 900000
				});
				if (!user.image) {
					user.image = image;
				}
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function onAuthFalied(req, res, error) {
		try {
			req.session.token = undefined;
			req.session.user = undefined;
			req.session.IsLoggedIn = false;
			auth.deleteSession(req, (response) => { })
			req.cookies.sessionId = undefined;
			res.clearCookie('sessionId', { domain: 'pepcoding.com' });
			res.clearCookie('sessionId', { domain: "classroom.pepcoding.com" });
			res.clearCookie('sessionId', { domain: "www.pepcoding.com" });
			var err = error ? JSON.parse(error) : '';
			let loginType = req.body.loginType;

			if (loginType == "popup") {
				var template = `<div id="errorMessage"
				class="alert alert-danger {{#ifCond isResendEmail '==' true}}  {{else}} red-text {{/ifCond}} {{#unless errorsMessage  }} hide{{errorsMessage}} {{/unless}}">
				{{errorsMessage}}
				{{#ifCond isResendEmail '==' true}}
				</br>
				<input type="hidden" value="{{userId}}" id="userId">
                    <input type="hidden" value="{{userName}}" id="userName">
                    <input type="hidden" value="{{email}}" id="email">
                    <input type="hidden" value="{{id}}" id="id">
				  <a href="#" onclick="resendActivationLink();" class="blue-text text-underline">Resend
					Activation
					Link</a>
				{{/ifCond}}
			  </div>`
				var compiledTemplate = handlebars.compile(template);
				var data = compiledTemplate({
					isResendEmail: false,
					errorsMessage: err,
					user: req.body
				})
				var response = responseInit(false, "Failure.", data);
				res.status(500).json(response);
			}
			else {
				renderLoginPage(req, res, false, err, false, req.body);
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(400).end(JSON.stringify({
				error: error
			}))
		}
	}

	function register(req, res) {
		try {
			renderLoginPage(req, res, false);
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};

	function popupSignUpErrorTemplate(errors,userData){
		let template=`<div class="formsection">
			<div class="row form-group input-field">
				<input type="text" class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 validate form-control "
				placeholder="Name" name="name" required value="${userData.name}">
				{{#if errors}}
				{{#each errors}}
					{{#ifCond param '==' 'name'}}
					<h5 class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 alert alert-danger red-text">{{msg}}
					</h5>
					{{/ifCond}}
				{{/each}}
				{{/if}}
			</div>
			<div class="row form-group input-field">
				<input type="email" class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 validate form-control "
				placeholder="Email" name="email" required value="${userData.email}">
				{{#if errors}}
				{{#each errors}}
					{{#ifCond param '==' 'email'}}
					<h5 class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 alert alert-danger red-text">{{msg}}
					</h5>
					{{/ifCond}}
				{{/each}}
				{{/if}}
			</div>
			<div class="row form-group input-field">
				<input type="password" class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 validate form-control "
				placeholder="Password" name="password" required>
				{{#if errors}}
				{{#each errors}}
					{{#ifCond param '==' 'password'}}
					<h5 class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 alert alert-danger red-text">{{msg}}
					</h5>
					{{/ifCond}}
				{{/each}}
				{{/if}}
			</div>
			<div class="row form-group input-field">
				<input type="password" class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 validate form-control "
				placeholder="Confirm Password" name="password2" required>
				{{#if errors}}
				{{#each errors}}
					{{#ifCond param '==' 'password2'}}
					<h5 class="col l8 s10 m10 offset-m1 offset-s1 offset-l2 alert alert-danger red-text">{{msg}}
					</h5>
					{{/ifCond}}
				{{/each}}
				{{/if}}
			</div>
			<br>
			<div class="row form-group ">
				<button class="btn waves-effect waves-light col l8 s10 m10 offset-m1 offset-s1  offset-l2 "
				type="submit" name="action">SignUp</button>
			</div>
			</div>`;

		let compiledTemplate = handlebars.compile(template);
		let data = compiledTemplate({
			errors
		})
		let response = responseInit(false, "Failure.", data);
		return response;
	}

	function registerPost(req, res) {
		// Validation
		let loginType=req.body.loginType;
		req.checkBody('name', 'Name is required.').trim().notEmpty();
		req.checkBody('email', 'Email is required.').notEmpty();
		req.checkBody('password', 'Password must be 6 to 20 characters long.').len(6, 20).notEmpty();
		req.checkBody('password2', 'Passwords do not match.').equals(req.body.password);
		var errors = req.validationErrors();
		if (errors) {
			if(loginType=="popup"){
				let userData = {
					name: req.body.name,
					email: req.body.email
				};
				let response=popupSignUpErrorTemplate(errors,userData);
				res.status(500).json(response);
			}
			else{
				renderLoginPage(req, res, true, errors, false, req.body);
			}
			
		} else {
			try {
				let userData = {
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				};
				user.Init(userData, constant.roles.guest, 0);

				request.post('/register', user, req, function (data) {
					let loginType=req.body.loginType;
					if (data.success == true && data.userId) {
						emailService.sendAccountActivation(req, res, userData.email, userData.name, data.userId, function () {
							if(loginType=="popup"){
								let template=`<div id="errorMessage"
									class="alert alert-danger {{#unless errorsMessage  }} hide{{errorsMessage}} {{/unless}}">
									{{errorsMessage}}
								</div>`;
								var compiledTemplate = handlebars.compile(template);
								var data = compiledTemplate({
									errorsMessage: constant.emailMessages.checkmail ? constant.emailMessages.checkmail : ''
								})
								var response = responseInit(true, "Success.", data);
								res.status(200).json(response);
							}
							else{
								return res.render('login', {
									sendMailSuccessMsg: constant.emailMessages.checkmail ? constant.emailMessages.checkmail : ''
								});
							}
							
						}, function () {
							if(loginType=="popup"){
								let template=`<div id="errorMessage"
									class="alert alert-danger {{#unless errorsMessage  }} hide{{errorsMessage}} {{/unless}}">
									{{errorsMessage}}
								</div>`;
								var compiledTemplate = handlebars.compile(template);
								var data = compiledTemplate({
									errorsMessage: constant.emailMessages.error
										? constant.emailMessages.error
										: "error",
								})
								var response = responseInit(true, "Success.", data);
								res.status(200).json(response);
							}
							else{
								return res.render("login", {
									sendMailSuccessMsg: constant.emailMessages.error
										? constant.emailMessages.error
										: "error",
								});
							}
							
						});

					} else {
						console.log("error in registering user " + user.email);
					}
				}, function (data) {
					var errors = [{
						msg: data ? JSON.parse(data) : 'something went wrong',
						param: 'email'
					}];
					if (loginType == "popup") {
						let response = popupSignUpErrorTemplate(errors,userData);
						res.status(500).json(response);
					}
					else{
						renderLoginPage(req, res, true, errors, false, req.body);
					}
					
				});
			} catch (error) {
				console.error(error);
				res.sendStatus(500).end(JSON.stringify({
					error: "checkUserExist in AuthApi: " + error
				}))
			}
		}
	};

	function nadosregisterPost(req, res) {
		// Validation
		req.checkBody('name', 'Name is required.').trim().notEmpty();
		req.checkBody('email', 'Email is required.').notEmpty();
		req.checkBody('password', 'Password must be 6 to 20 characters long.').len(6, 20).notEmpty();
		req.checkBody('password2', 'Passwords do not match.').equals(req.body.password);
		var errors = req.validationErrors();
		if (errors) {
			renderLoginPage(req, res, true, errors, false, req.body);
		} else {
			try {
				var userData = {
					name: req.body.name,
					email: req.body.email,
					password: req.body.password
				};
				user.Init(userData, constant.roles.guest, 0);

				request.post('/nadosregister', user, req, function (data) {
					if (data.success == true && data.userId) {
						res.status(200).send("User Successfully Register");
					} else {
						console.log("error in registering user " + user.email);
					}
				}, function (data) {
					var errors = [{
						msg: data ? JSON.parse(data) : 'something went wrong',
						param: 'email'
					}];
					renderLoginPage(req, res, true, errors, false, req.body);
				});
			} catch (error) {
				console.error(error);
				res.sendStatus(500).end(JSON.stringify({
					error: "checkUserExist in AuthApi: " + error
				}))
			}
		}
	};

	function logout(req, res) {
		try {

			req.session.token = undefined;
			req.session.user = undefined;
			req.session.IsLoggedIn = false;
			auth.deleteSession(req, (response) => { })
			req.cookies.sessionId = undefined;
			res.clearCookie('sessionId', { domain: "pepcoding.com" });
			res.clearCookie('sessionId', { domain: "classroom.pepcoding.com" });
			res.clearCookie('sessionId', { domain: "www.pepcoding.com" });
			res.clearCookie('userId', { domain: "pepcoding.com" });
			res.clearCookie('G_AUTHUSER_H', { domain: "pepcoding.com" });
			res.end('{"status" : 200}');
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	};

	function renderResetPasswordPage(req, res, isTokenValid, errors, createdTime, expiryTime, user) {
		try {
			var message = isTokenValid == false ? 'Your token has been expired' : ''
			res.render('resetpassword', {
				user: (req.session && req.session.user && req.session.IsLoggedIn) ? req.session.user : null,
				isTokenValid: isTokenValid,
				email: user ? user.email : '',
				userId: user ? user.userId : '',
				createdTime: createdTime,
				expiryTime: expiryTime,
				message: message,
				errors: errors ? errors : ''
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}


	function resetPasswordpage(req, res) {
		try {
			var token = req.params.token;
			if (token) {
				request.get('/user/token/' + token, req, function (response) {
					if (response && response.success && response.data.length > 0) {
						var user = response.data[0];
						var createdTime = Date.parse(user.createdTime);
						var expiryTime = Date.parse(user.expiryTime);
						var currentTime = Date.now();
						if (createdTime < expiryTime && currentTime < expiryTime) {
							renderResetPasswordPage(req, res, true, {}, createdTime, expiryTime, user);
						} else {
							renderResetPasswordPage(req, res, false);
						}
					} else {
						renderResetPasswordPage(req, res, false);
					}

				}, function (error) {
					renderResetPasswordPage(req, res, false);
				});
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function forgotpasswordpage(req, res) {
		try {
			renderForgotPasswordPage(req, res, true);
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};

	function renderForgotPasswordPage(req, res, isUserExist, errors, message) {
		try {
			res.render('forgotpassword', {
				user: (req.session && req.session.user && req.session.IsLoggedIn) ? req.session.user : null,
				errors: errors ? errors : '',
				sendMailSuccessMsg: message ? message : '',
				isUserExist: isUserExist ? isUserExist : ''
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function forgotPassword(req, res) {
		// Validation
		try {
			req.checkBody('email', 'Email is required').notEmpty().isEmail();
			var errors = req.validationErrors();
			if (errors) {
				renderForgotPasswordPage(req, res, true, errors);
			} else {
				var email = req.body.email;
				try {
					request.get('/user/checkEmailExist/' + email, req, function (response) {
						if (response && response.success) {

							if (response.token) {
								sendForgotPasswordEmail(req, res, response.userId, email, response.name);
							}
						} else {
							renderForgotPasswordPage(req, res, false, {}, response.message)
						}

					}, function (error) {
						res.status(500).end()
					});
				} catch (error) {
					res.status(422).json({
						'success': false,
						'message': constant.emailMessages.validemail ? constant.emailMessages.validemail : '',
						'error': error.message
					});
				}
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};

	function sendForgotPasswordEmail(req, res, userId, email, name) {
		try {
			if (userId && email && name) {
				var user = {
					userId: userId,
					email: email
				};
				request.post('/forgotpassword', user, req, function (data) {
					if (data.success && data.token && data.subscriptionToken) {
						emailService.sendForgotPwdEmail(req, res, email, name, data.token, data.subscriptionToken, function () {
							return res.render('forgotpassword', {
								sendMailSuccessMsg: constant.emailMessages.furtherinstruction ? constant.emailMessages.furtherinstruction : ''
							});
						}, function () {
							return res.render('forgotpassword', {
								sendMailSuccessMsg: constant.emailMessages.error ? constant.emailMessages.error : ''
							});
						});
					} else {
						res.status(500).json({
							message: 'error',
							success: false
						});
					}
				}, function (data) {
					return res.render('forgotpassword', {
						sendMailSuccessMsg: 'Internal Server Error'
					});
				});
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "error"
			}))
		}
	}

	function resetpassword(req, res) {
		try {
			// Validation
			req.checkBody('password', 'Password must be 6 to 20 characters long.').len(6, 20).notEmpty();
			req.checkBody('confirmpassword', 'Passwords do not match').equals(req.body.password);
			req.checkBody('email', 'Email is required').notEmpty().isEmail();
			req.checkBody('userId', 'userId is required').notEmpty();

			var errors = req.validationErrors();
			if (errors) {
				var user = {
					email: req.body.email,
					userId: req.body.userId
				}
				renderResetPasswordPage(req, res, true, errors, req.body.createdTime, req.body.expiryTime, user);
			} else {
				try {
					var userId = req.body.userId;
					var expiryTime = req.body.expiryTime;
					var createdTime = req.body.createdTime;
					var currentTime = Date.now();

					var data = {
						password: req.body.password,
						email: req.body.email
					};

					if (createdTime < expiryTime && currentTime < expiryTime) {
						request.post('/resetpassword/' + userId, data, req, function (response) {
							if (response && response.success) {
								res.redirect("/login");
							} else {
								res.status(500).json({
									message: 'something went wrong'
								});
							}

						}, function (error) {
							res.status(500).end()
						});
					} else {
						res.status(500).json({
							message: 'token has been expired'
						});
					}
				} catch (error) {
					res.status(422).json({
						'success': false,
						'message': "please provide a valid input",
						'error': error.message
					});
				}
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};


	function emailUnSubscribe(req, res) {
		try {
			var token = req.params.token;
			if (token) {
				jwt.verify(token, config.secret, function (err, user) {
					req.session.token = user.token;
					req.session.user = user;
				});
				res.render('email/email-unSubscribe', {
					user: (req.session && req.session.user) ? req.session.user : null
				});
			} else {
				res.status(500).json({
					message: 'something went wrong'
				});
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};


	function unSubscribeMe(req, res) {
		// Validation
		req.checkBody('userId', 'userId is required').notEmpty();
		req.checkBody('email', 'email is required').notEmpty();

		var errors = req.validationErrors();
		if (errors) {
			res.render('email/email-unSubscribe', {
				errors: errors
			});
		} else {
			try {
				var userId = req.body.userId;
				var email = req.body.email;
				var data = {
					userId: userId,
					isSubscribed: false
				}
				request.put('/subscription', data, req, function (response) {
					if (response && response.success) {
						var message = email + constant.emailMessages.unsubscribe ? constant.emailMessages.unsubscribe : '';
						res.render('email/email-unSubscribe', {
							successMessage: message
						});
					} else {
						res.status(500).json({
							message: constant.emailMessages.error ? constant.emailMessages.error : 'error'
						});
					}

				}, function (error) {
					res.status(500).end()
				});
			} catch (error) {
				res.status(500).json({
					'success': false,
					'message': "error",
					'error': error.message
				});
			}
		}
	};

	function activateAccount(req, res) {
		try {
			var userId = req.params.userId;
			if (userId) {
				var data = {
					userId: userId
				}
				request.put('/account/activation', data, req, function (response) {
					if (response && response.success) {
						res.render('email/account-activation', {
							message: constant.emailMessages.successactivation ? constant.emailMessages.successactivation : ''
						});
					} else {
						res.render('email/account-activation', {
							message: constant.emailMessages.error ? constant.emailMessages.error : ''
						});
					}

				}, function (error) {
					res.render('email/account-activation', {
						message: constant.emailMessages.error ? constant.emailMessages.error : ''
					});
				});
			} else {
				res.render('email/account-activation', {
					message: constant.emailMessages.error ? constant.emailMessages.error : ''
				});
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};

	function verifyOTP(req, res) {
		try {
			var otp = req.body.otp;
			if (otp) {
				otpService.verifyOtp(otp, function (data) {
					var phone = req.session.user.phone;
					var updatedPhone = req.body.phone;
					if (phone != updatedPhone) {
						var data = {
							phone: updatedPhone,
							isPhoneVerified: true
						}
						request.put('/user/phone/verify', data, req, function (data) {
							if (data && data.success) {
								req.session.user.phone = updatedPhone;
								res.status(200).json({
									'message': 'your OTP is verified. Now You can proceed to furthur.'
								});
							} else {
								res.status(500).json({
									'message': 'error while updating your phone.',
								});
							}
						}, function (data) {
							res.status(500).json({
								'message': 'something went wrong while updating your phone',
							});
						});
					}
				}, function (error) {
					res.status(500).json({
						'message': error
					});
				});
			} else {
				res.status(422).json({
					'message': "otp cannot be empty."
				});
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function changepasswordPage(req, res) {
		try {
			renderChangepasswordPage(req, res);
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function renderChangepasswordPage(req, res, errors) {
		try {
			res.render('changepassword', {
				user: (req.session && req.session.user && req.session.IsLoggedIn) ? req.session.user : null,
				errors: errors ? errors : ''
			});
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	}

	function changepassword(req, res) {
		try {
			req.checkBody('password', 'Password must be 6 to 20 characters long.').len(6, 20);
			req.checkBody('confirmpassword', 'Passwords do not match').equals(req.body.password);

			var errors = req.validationErrors();
			if (errors) {
				renderChangepasswordPage(req, res, errors);
			} else {
				try {
					var data = {
						password: req.body.password,
					};

					request.put('/changePassword', data, req, function (response) {
						if (response && response.success) {
							req.session.token = undefined;
							req.session.user = undefined;
							req.session.IsLoggedIn = false;
							auth.deleteSession(req, (response) => { })
							req.cookies.sessionId = undefined;
							res.clearCookie('sessionId', { domain: 'pepcoding.com' });
							res.clearCookie('sessionId', { domain: "classroom.pepcoding.com" });
							res.clearCookie('sessionId', { domain: "www.pepcoding.com" });
							res.clearCookie('userId', { domain: 'pepcoding.com' });
							res.clearCookie('G_AUTHUSER_H', { domain: 'pepcoding.com' });
							res.redirect('/index');
						} else {
							var response = responseInit(false, 'Error while changing your profile.');
							res.status(500).json(response);
						}
					}, function (error) {
						var response = responseInit(false, 'Something went wrong.');
						res.status(500).json(response);
					});
				} catch (error) {
					console.error(error);
					res.sendStatus(500).end(JSON.stringify({
						error: "Internal server error "
					}))
				}
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};
	function nadoschangepassword(req, res) {
		try {
			req.checkBody('password', 'Password must be 6 to 20 characters long.').len(6, 20);
			req.checkBody('confirmpassword', 'Passwords do not match').equals(req.body.password);
			req.checkBody('email', "Email is invalid");

			var errors = req.validationErrors();
			if (errors) {
				res.status(400).send(errors);
			} else {
				try {
					var data = {
						password: req.body.password,
						email: req.body.email
					};

					request.put('/nadoschangePassword', data, req, function (response) {
						if (response && response.success) {
							res.status(200).json(response);
						} else {
							var response = responseInit(false, 'Error while changing your profile.');
							res.status(500).json(response);
						}
					}, function (error) {
						var response = responseInit(false, 'Something went wrong.');
						res.status(500).json(response);
					});
				} catch (error) {
					console.error(error);
					res.sendStatus(500).end(JSON.stringify({
						error: "Internal server error "
					}))
				}
			}
		} catch (error) {
			console.error(error);
			res.sendStatus(500).end(JSON.stringify({
				error: "Internal server error "
			}))
		}
	};


	function checkSession(req, res) {
		if (req.session.user) {
			var decodedToken = jwt.decode(req.session.token);
			var isAdmin = req.session.user.role === constant.roles.admin ? true : false;
			if (isAdmin) {
				res.status(200).end();
			}
			else {
				request.get('/getLastLogin/' + req.session.user.userId, req,
					function (response) {
						if (new Date(decodedToken.iat * 1000) < new Date(Number(response.data) * 1000)) {
							req.session.token = undefined;
							req.session.user = undefined;
							req.session.IsLoggedIn = false;
							auth.deleteSession(req, (response) => { })
							req.cookies.sessionId = undefined;
							res.clearCookie('sessionId', { domain: 'pepcoding.com' });
							res.clearCookie('sessionId', { domain: "classroom.pepcoding.com" });
							res.clearCookie('sessionId', { domain: "www.pepcoding.com" });
							res.clearCookie('userId', { domain: 'pepcoding.com' });
							res.clearCookie('G_AUTHUSER_H', { domain: 'pepcoding.com' });
							res.status(440).send("Session Expired").end();
						} else
							res.status(200).end();
					},
					function (error) {
						console.log(error);
						res.sendStatus(500).end(JSON.stringify({
							error: "unable to fetch last login "
						}))
					})
			}
		} else
			res.status(200).end();
	}

	async function googleOAuth(req, res) {
		let resp = await axios.post("https://oauth2.googleapis.com/token", {
			code: req.body.code,
			client_id: config.googleAuth.client_id,
			client_secret: config.googleAuth.client_secret,
			redirect_uri: "https://" + config.appUrl + "/authorizing.html",
			grant_type: "authorization_code"
		});
		console.log(resp.data);

		res.cookie('token', resp.data["access_token"], {
			maxAge: 43200000
		});
		res.end();
	}

	retVal.nadoschangepassword = nadoschangepassword;
	retVal.nadosregisterPost = nadosregisterPost;
	retVal.login = login;
	retVal.loginPost = loginPost;
	retVal.register = register;
	retVal.registerPost = registerPost;
	retVal.logout = logout;
	retVal.loginPostSocial = loginPostSocial;
	retVal.resetPasswordpage = resetPasswordpage;
	retVal.forgotPassword = forgotPassword;
	retVal.forgotpasswordpage = forgotpasswordpage;
	retVal.resetpassword = resetpassword;
	retVal.emailUnSubscribe = emailUnSubscribe;
	retVal.unSubscribeMe = unSubscribeMe;
	retVal.activateAccount = activateAccount;
	retVal.resendActivationLink = resendActivationLink;
	retVal.verifyOTP = verifyOTP;
	retVal.changepasswordPage = changepasswordPage;
	retVal.changepassword = changepassword;
	retVal.checkSession = checkSession;
	retVal.googleOAuth = googleOAuth;
	retVal.setCookie = setCookie;
	retVal.cookieRedirect = cookieRedirect;
	retVal.clearCookie = clearCookie;

	return retVal;
})();
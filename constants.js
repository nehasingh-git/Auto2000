module.exports = (function () {
    // variables
    var retVal, config;

    // assign variables
    retVal = {};
    var path = require('path');
    config = require("./config.json");

    
    retVal.emailMessages = {
    }

    retVal.folderPaths = {
        dataDirPath: path.join(__dirname, '/public'),
    }

   

    retVal.statusCode = {
        ok: 200,
        accepted: 202, //The request has been accepted for processing, but the processing has not been completed
        noContent: 204, //The server has fulfilled the request but does not need to return an entity-body, and might want to return updated metainformation. successful requests without a response body.
        badRequest: 400, //The request could not be understood by the server due to malformed syntax. The client SHOULD NOT repeat the request without modifications
        unAuthorized: 401, //The request requires user authentication.
        paymentRequired: 402,
        forbidden: 403, //The invoker is not authorized to invoke the operation.
        notFound: 404, //The server has not found anything matching the Request-URI.
        requestTimeOut: 408,
        conflict: 409, //duplicate Resource
        unProcessable: 422, //missing
        redirect: 451,
        requestHeaderTooLarge: 494,
        tokenExpired: 498,
        tokenRequired: 499,
        internalServerError: 500, //The service is not available or server configuration issue.
        serviceUnavailable: 503 //Indicates that the services is temporarily unavailable due to system overload or maintenance
    }

    // return module
    return retVal;
})();
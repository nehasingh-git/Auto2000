module.exports = (function () {
    // variables
    var retVal, fs, path;

    // assign variables
    retVal = {};
    fs = require("fs");
    path = require("path");
    constants = require('../constants');

    function readFile(fileName, folderName) {
        try {
            var dirPath = path.join(__dirname, '../public/data/', folderName, fileName);
            var obj = JSON.parse(fs.readFileSync(dirPath, 'utf8'));
            return obj;
        } catch (error) {
            console.log(error);
        }
    }
    retVal.readFile = readFile;
    return retVal;
})();
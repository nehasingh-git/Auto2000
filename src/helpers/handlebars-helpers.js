module.exports = (function () {

    var retval = {};
    var config = require("../config.json");
    var version = config.staticDataVersion;
    var isMinified = config.minificatonEnabled;
    var moment = require('moment');
    const Cryptr = require('cryptr');
    var cryptr
  
    var ifeq = function (a, b, options) {
      if (a === b) {
        return options.fn(this);
      }
      return options.inverse(this);
    }
  
    var bar = function () {
      return "BAR!";
    }
  
    var ifGreaterOrEqual = function (v1, v2, options) {
      val1 = parseFloat(v1);
      val2 = parseFloat(v2);
      if (val1 >= val2) {
        return options.fn(this);
      }
      return options.inverse(this);
    }
  
    var ifEqual = function (v1, v2, options) {
      if (parseInt(v1) === parseInt(v2)) {
        return options.fn(this);
      } else {
        return "";
      }
    }
  
    var makeList = function (v1, v2, options) {
      val = "";
      for (i = 0; i < v1; i++) {
        val += options;
      }
      return val;
    }
  
    var section = function (name, options) {
      if (!this._sections) this._sections = {};
      this._sections[name] = options.fn(this);
      return null;
    }
  
    var math = function (lvalue, operator, rvalue, options) {
      lvalue = parseFloat(lvalue);
      rvalue = parseFloat(rvalue);
  
      return {
        "+": lvalue + rvalue,
        "-": lvalue - rvalue,
        "*": lvalue * rvalue,
        "/": lvalue / rvalue,
        "%": lvalue % rvalue
      }[operator];
    }
  
    var percent = function (price, gst) {
      try {
        // var price = Math.round(price).toFixed(2);
        var gst = (gst / 100).toFixed(2);
        var gstAmount = (price * gst).toFixed(2);
        var total = Number(price) + Number(gstAmount);
        return total;
      } catch (error) {
        console.log(error);
      }
    }
  
    // 12000 / (1 + (.18)) 
  
    var withoutGSTPrice = function (price, gst) {
      try {
        var gst = (gst / 100).toFixed(2);
        var gstAmount = (Number(1) + Number(gst)).toFixed(2);
        var total = Number(price) / Number(gstAmount);
        return total.toFixed(2);
      } catch (error) {
        console.log(error);
      }
    }
  
    var roundOffDecimal = function (num, places) {
      try {
        return Number(num).toFixed(places);
      } catch (error) {
        console.log(error);
      }
    }
  
    var ifCond = function (v1, operator, v2, options) {
      switch (operator) {
        case '==':
          return (v1 == v2) ? options.fn(this) : options.inverse(this);
        case '===':
          return (v1 === v2) ? options.fn(this) : options.inverse(this);
        case '!=':
          return (v1 != v2) ? options.fn(this) : options.inverse(this);
        case '!==':
          return (v1 !== v2) ? options.fn(this) : options.inverse(this);
        case '<':
          return (v1 < v2) ? options.fn(this) : options.inverse(this);
        case '<=':
          return (v1 <= v2) ? options.fn(this) : options.inverse(this);
        case '>':
          return (v1 > v2) ? options.fn(this) : options.inverse(this);
        case '>=':
          return (v1 >= v2) ? options.fn(this) : options.inverse(this);
        case '&&':
          return (v1 && v2) ? options.fn(this) : options.inverse(this);
        case '||':
          return (v1 || v2) ? options.fn(this) : options.inverse(this);
        case '%':
          return (v1 % v2) ? options.fn(this) : options.inverse(this);
        default:
          return options.inverse(this);
      }
    }
  
    var checkIf = function (v1, o1, v2, mainOperator, v3, o2, v4, options) {
      var operators = {
        '==': function (a, b) {
          return a == b
        },
        '===': function (a, b) {
          return a === b
        },
        '!=': function (a, b) {
          return a != b
        },
        '!==': function (a, b) {
          return a !== b
        },
        '<': function (a, b) {
          return a < b
        },
        '<=': function (a, b) {
          return a <= b
        },
        '>': function (a, b) {
          return a > b
        },
        '>=': function (a, b) {
          return a >= b
        },
        '&&': function (a, b) {
          return a && b
        },
        '||': function (a, b) {
          return a || b
        },
      }
      var a1 = operators[o1](v1, v2);
      var a2 = operators[o2](v3, v4);
      var isTrue = operators[mainOperator](a1, a2);
      return isTrue ? options.fn(this) : options.inverse(this);
    }
  
    var assign = function (varName, varValue, options) {
      if (!options.data.root) {
        options.data.root = {};
      }
      options.data.root[varName] = varValue;
    }
  
    var showColor = function (v1, options) {
      lvalue = parseInt(v1);
  
      if (lvalue % 4 === 0) {
        return 'grey darken-1';
      }
      if (lvalue % 3 === 0) {
        return 'teal';
      }
      if (lvalue % 2 === 0) {
        return 'red';
      }
      return 'blue-grey darken-1';
    }
  
    var times = function (n, block) {
      var accum = '';
      for (var i = 0; i < n; ++i)
        accum += block.fn(i);
      return accum;
    }
  
    var each_when = function (list, k, v, opts) {
      var i, result = '';
      for (i = 0; i < list.length; ++i)
        if (list[i][k] == v)
          result = result + opts.fn(list[i]);
      return result;
    }
  
    var concat = function () {
      var outStr = '';
      for (var arg in arguments) {
        if (typeof arguments[arg] == 'string') {
          outStr += arguments[arg];
        }
      }
      return outStr;
    }
  
  
    var concatAll = function () {
      var outStr = '';
      for (var arg in arguments) {
        if (typeof arguments[arg] == 'string') {
          outStr += arguments[arg];
        } else if (typeof arguments[arg] == 'number') {
          outStr += arguments[arg];
        }
      }
      return outStr;
    }
  
    var replace = function (find, replace, options) {
      var str = options.fn(this);
      /// return string.replace(find, replace);
      return str.split(find).join(replace);
  
    }
  
    var toLowerCase = function (str) {
      return str.toLowerCase();
    }
  
    var toUpperCase = function (str) {
      return str.toUpperCase();
    };
  
    var toString = function (str) {
      return str.toString();
    }
  
    var chain = function () {
      var helpers = [],
        value;
      $.each(arguments, function (i, arg) {
        if (Handlebars.helpers[arg]) {
          helpers.push(Handlebars.helpers[arg]);
        } else {
          value = arg;
          $.each(helpers, function (j, helper) {
            value = helper(value, arguments[i + 1]);
          });
          return false;
        }
      });
      return value;
    }
  
  
    var withItem = function (object, options) {
      if (object) {
        return options.fn(object[options.hash.key]);
      }
      return object;
    }
  
    var renderJs = function (file) {
      var isBundle = isMinified == true ? 'bundle/' : '';
      var scriptPath = '<script type="text/javascript" src="/js/' + isBundle + file + '.js?' + version + '"></script>';
      return scriptPath;
    }
  
    var replaceHtml = function (str) {
      if (str) {
        str = str.toString();
        return str.replace(/(<([^>]+)>)/ig, '');
      } else
        return str;
    }
  
    function getBase64(data) {
      var base64data = Buffer.from(data).toString('base64');
      return base64data;
    }
  
    function getDataFromBase64(base64) {
      if (base64) {
        var text = Buffer.from(base64, 'base64').toString('ascii');
        return text;
      } else
        return "";
    }
  
    function encryptString(string) {
      cryptr = new Cryptr(config.zoomURLSecret);
      return cryptr.encrypt(string);
    }
  
    function decryptString(string) {
      cryptr = new Cryptr(config.zoomURLSecret);
      return cryptr.decrypt(string);
    }
  
    function formatDate(datetime, format) {
      var mmnt = moment(datetime);
      return mmnt.format(format);
    }
  
    function getTimeDifference(startTime, endTime) {
      var ms = moment(endTime).diff(moment(startTime));
      var d = moment.duration(ms);
      return Math.floor(d.asHours()) + moment.utc(ms).format(":mm:ss");
    }
  
    function invertBool(boolValue) {
      return !boolValue;
    }
  
  
    retval.ifeq = ifeq;
    retval.bar = bar;
    retval.ifGreaterOrEqual = ifGreaterOrEqual;
    retval.math = math;
    retval.ifEqual = ifEqual;
    retval.makeList = makeList;
    retval.ifCond = ifCond;
    retval.percent = percent;
    retval.withoutGSTPrice = withoutGSTPrice;
    retval.roundOffDecimal = roundOffDecimal;
    retval.showColor = showColor;
    retval.times = times;
    retval.each_when = each_when;
    retval.concatAll = concatAll;
    retval.toString = toString;
    retval.chain = chain;
    retval.withItem = withItem;
    retval.renderJs = renderJs;
    retval.replace = replace;
    retval.toLowerCase = toLowerCase;
    retval.toUpperCase = toUpperCase;
    retval.replaceHtml = replaceHtml;
    retval.section = section;
    retval.assign = assign;
    retval.checkIf = checkIf;
    retval.concat = concat;
    retval.getBase64 = getBase64;
    retval.getDataFromBase64 = getDataFromBase64;
    retval.encryptString = encryptString;
    retval.decryptString = decryptString;
    retval.formatDate = formatDate;
    retval.getTimeDifference = getTimeDifference;
    retval.invertBool = invertBool;
    return retval;
  
  })();
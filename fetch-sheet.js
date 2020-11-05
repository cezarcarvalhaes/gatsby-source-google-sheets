"use strict";

exports.__esModule = true;
exports.guessColumnsDataTypes = exports.cleanRows = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var GoogleSpreadsheet = require("google-spreadsheet");
var _ = require("lodash");

var getSpreadsheet = function getSpreadsheet(spreadsheetId, credentials) {
  return new Promise(function (resolve, reject) {
    var doc = new GoogleSpreadsheet(spreadsheetId);
    doc.useServiceAccountAuth(credentials, function (err) {
      if (err) reject(err);else resolve(doc);
    });
  });
};

var getWorksheetByTitle = function getWorksheetByTitle(spreadsheet, worksheetTitle) {
  return new Promise(function (resolve, reject) {
    return spreadsheet.getInfo(function (e, s) {
      if (e) reject(e);
      var targetSheet = s.worksheets.find(function (sheet) {
        return sheet.title === worksheetTitle;
      });
      if (!targetSheet) {
        reject(`Found no worksheet with the title ${worksheetTitle}`);
      }
      resolve(targetSheet);
    });
  });
};

var getRows = function getRows(worksheet) {
  var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
  return new Promise(function (resolve, reject) {
    return worksheet.getRows(options, function (err, rows) {
      if (err) reject(err);else {
        resolve(rows);
      }
    });
  });
};

var cleanRows = function cleanRows(rows) {
  var columnTypes = guessColumnsDataTypes(rows);
  return rows.map(function (r) {
    return _.chain(r).omit(["_xml", "app:edited", "save", "del", "_links"]).mapKeys(function (v, k) {
      return _.camelCase(k);
    }).mapValues(function (val, key) {
      switch (columnTypes[key]) {
        case "number":
          return Number(val.replace(/,/g, ""));
        case "boolean":
          // when column contains null we return null, otherwise check boolean value
          return val === null ? null : val === "TRUE";
        default:
          return val;
      }
    }).value();
  });
};

var guessColumnsDataTypes = function guessColumnsDataTypes(rows) {
  return _.flatMap(rows, function (r) {
    return _.chain(r).omit(["_xml", "app:edited", "save", "del", "_links"]).mapKeys(function (v, k) {
      return _.camelCase(k);
    }).mapValues(function (val) {
      // try to determine type based on the cell value
      if (!val) {
        return "null";
      } else if (val.replace(/[,\.\d]/g, "").length === 0) {
        // sheets apparently leaves commas in some #s depending on formatting
        return "number";
      } else if (val === "TRUE" || val === "FALSE") {
        return "boolean";
      } else {
        return "string";
      }
    }).value();
  }).reduce(function (columnTypes, row) {
    _.forEach(row, function (type, columnName) {
      // skip nulls, they should have no effect
      if (type === "null") {
        return;
      }

      var currentTypeCandidate = columnTypes[columnName];
      if (!currentTypeCandidate) {
        // no discovered type yet -> use the one from current item
        columnTypes[columnName] = type;
      } else if (currentTypeCandidate !== type) {
        // previously discovered type is different therefore we fallback to string
        columnTypes[columnName] = "string";
      }
    });
    return columnTypes;
  }, {});
};

var fetchData = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(spreadsheetId, worksheetTitle, credentials) {
    var spreadsheet, worksheet, rows;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return getSpreadsheet(spreadsheetId, credentials);

          case 2:
            spreadsheet = _context.sent;
            _context.next = 5;
            return getWorksheetByTitle(spreadsheet, worksheetTitle);

          case 5:
            worksheet = _context.sent;
            _context.next = 8;
            return getRows(worksheet);

          case 8:
            rows = _context.sent;
            return _context.abrupt("return", cleanRows(rows));

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function fetchData(_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
}();

exports.cleanRows = cleanRows;
exports.guessColumnsDataTypes = guessColumnsDataTypes;
exports.default = fetchData;
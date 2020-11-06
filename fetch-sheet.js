"use strict";

exports.__esModule = true;
exports.guessColumnsDataTypes = exports.cleanRows = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("google-spreadsheet"),
    GoogleSpreadsheet = _require.GoogleSpreadsheet;

var _ = require("lodash");

var getSpreadsheet = function () {
  var _ref = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(spreadsheetId, credentials) {
    var doc;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.prev = 0;
            doc = new GoogleSpreadsheet(spreadsheetId);
            _context.next = 4;
            return doc.useServiceAccountAuth(credentials);

          case 4:
            return _context.abrupt("return", doc);

          case 7:
            _context.prev = 7;
            _context.t0 = _context["catch"](0);

            Promise.reject(_context.t0);

          case 10:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined, [[0, 7]]);
  }));

  return function getSpreadsheet(_x, _x2) {
    return _ref.apply(this, arguments);
  };
}();

var getWorksheetByTitle = function () {
  var _ref2 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee2(spreadsheet, worksheetTitle) {
    var targetSheet;
    return _regenerator2.default.wrap(function _callee2$(_context2) {
      while (1) {
        switch (_context2.prev = _context2.next) {
          case 0:
            _context2.prev = 0;
            _context2.next = 3;
            return spreadsheet.loadInfo();

          case 3:
            targetSheet = spreadsheet.sheetsByTitle[worksheetTitle];

            if (!(!targetSheet || typeof targetSheet === "undefined")) {
              _context2.next = 6;
              break;
            }

            return _context2.abrupt("return", Promise.reject(new Error(`Found no worksheet with the title ${worksheetTitle}`)));

          case 6:
            return _context2.abrupt("return", targetSheet);

          case 9:
            _context2.prev = 9;
            _context2.t0 = _context2["catch"](0);

            Promise.reject(_context2.t0);

          case 12:
          case "end":
            return _context2.stop();
        }
      }
    }, _callee2, undefined, [[0, 9]]);
  }));

  return function getWorksheetByTitle(_x3, _x4) {
    return _ref2.apply(this, arguments);
  };
}();

var getRows = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee3(worksheet) {
    var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
    var rows;
    return _regenerator2.default.wrap(function _callee3$(_context3) {
      while (1) {
        switch (_context3.prev = _context3.next) {
          case 0:
            _context3.prev = 0;
            _context3.next = 3;
            return worksheet.getRows(options);

          case 3:
            rows = _context3.sent;
            return _context3.abrupt("return", rows);

          case 7:
            _context3.prev = 7;
            _context3.t0 = _context3["catch"](0);

            Promise.reject(_context3.t0);

          case 10:
          case "end":
            return _context3.stop();
        }
      }
    }, _callee3, undefined, [[0, 7]]);
  }));

  return function getRows(_x6) {
    return _ref3.apply(this, arguments);
  };
}();

var cleanRows = function cleanRows(rows) {
  var trimmedRows = rows.map(function (r) {
    return _.omit(r, ["_sheet", "_rawProperties", "_cells", "_rowMetadata", "columnMetadata", "headerValues", "_rowNumber", "_rawData"]);
  });
  var columnTypes = guessColumnsDataTypes(trimmedRows);
  return trimmedRows.map(function (r) {
    return _.chain(r).mapKeys(function (v, k) {
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
    return _.chain(r).mapKeys(function (v, k) {
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
  var _ref4 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee4(spreadsheetId, worksheetTitle, credentials) {
    var spreadsheet, worksheet, rows;
    return _regenerator2.default.wrap(function _callee4$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            _context4.next = 2;
            return getSpreadsheet(spreadsheetId, credentials);

          case 2:
            spreadsheet = _context4.sent;
            _context4.next = 5;
            return getWorksheetByTitle(spreadsheet, worksheetTitle);

          case 5:
            worksheet = _context4.sent;
            _context4.next = 8;
            return getRows(worksheet);

          case 8:
            rows = _context4.sent;
            return _context4.abrupt("return", cleanRows(rows));

          case 10:
          case "end":
            return _context4.stop();
        }
      }
    }, _callee4, undefined);
  }));

  return function fetchData(_x7, _x8, _x9) {
    return _ref4.apply(this, arguments);
  };
}();

exports.cleanRows = cleanRows;
exports.guessColumnsDataTypes = guessColumnsDataTypes;
exports.default = fetchData;
"use strict";

var _regenerator3 = require("babel-runtime/regenerator");

var _regenerator4 = _interopRequireDefault2(_regenerator3);

var _asyncToGenerator4 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator5 = _interopRequireDefault2(_asyncToGenerator4);

var _arguments = arguments;

function _interopRequireDefault2(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

exports.__esModule = true;
exports.guessColumnsDataTypes = exports.cleanRows = undefined;

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var _require = require("google-spreadsheet"),
  GoogleSpreadsheet = _require.GoogleSpreadsheet;

var _ = require("lodash");

var getSpreadsheet = (function () {
  var _ref2 = (0, _asyncToGenerator5.default)(
    /*#__PURE__*/ _regenerator4.default.mark(function _callee2(spreadsheetId, credentials) {
      var doc;
      return _regenerator4.default.wrap(
        function _callee2$(_context2) {
          while (1) {
            switch ((_context2.prev = _context2.next)) {
              case 0:
                _context2.prev = 0;
                doc = new GoogleSpreadsheet(spreadsheetId);
                _context2.next = 4;
                return doc.useServiceAccountAuth(credentials);

              case 4:
                return _context2.abrupt("return", doc);

              case 7:
                _context2.prev = 7;
                _context2.t0 = _context2["catch"](0);

                Promise.reject(new Error(err));

              case 10:
              case "end":
                return _context2.stop();
            }
          }
        },
        _callee2,
        undefined,
        [[0, 7]]
      );
    })
  );

  return function getSpreadsheet(_x, _x5) {
    return _ref2.apply(this, arguments);
  };
})();

var getWorksheetByTitle = (function () {
  var _ref3 = (0, _asyncToGenerator5.default)(
    /*#__PURE__*/ _regenerator4.default.mark(function _callee3(spreadsheet, worksheetTitle) {
      var targetSheet;
      return _regenerator4.default.wrap(
        function _callee3$(_context3) {
          while (1) {
            switch ((_context3.prev = _context3.next)) {
              case 0:
                _context3.prev = 0;
                _context3.next = 3;
                return spreadsheet.loadInfo();

              case 3:
                targetSheet = spreadsheet.sheetsByTitle[worksheetTitle];

                if (!(!targetSheet || typeof targetSheet === "undefined")) {
                  _context3.next = 6;
                  break;
                }

                return _context3.abrupt(
                  "return",
                  Promise.reject(new Error(`Found no worksheet with the title ${worksheetTitle}`))
                );

              case 6:
                return _context3.abrupt("return", targetSheet);

              case 9:
                _context3.prev = 9;
                _context3.t0 = _context3["catch"](0);

                Promise.reject(new Error(_context3.t0));

              case 12:
              case "end":
                return _context3.stop();
            }
          }
        },
        _callee3,
        undefined,
        [[0, 9]]
      );
    })
  );

  return function getWorksheetByTitle(_x6, _x7) {
    return _ref3.apply(this, arguments);
  };
})();

var getRows = (function () {
  var _ref4 = (0, _asyncToGenerator5.default)(
    /*#__PURE__*/ _regenerator4.default.mark(function _callee4(worksheet) {
      var options, rows, trimmedRows;
      return _regenerator4.default.wrap(
        function _callee4$(_context4) {
          while (1) {
            switch ((_context4.prev = _context4.next)) {
              case 0:
                options = _arguments.length > 1 && _arguments[1] !== undefined ? _arguments[1] : {};
                _context4.prev = 1;
                _context4.next = 4;
                return worksheet.getRows(options);

              case 4:
                rows = _context4.sent;
                trimmedRows = rows.map(function (r) {
                  return _.omit(r, [
                    "_sheet",
                    "_rawProperties",
                    "_cells",
                    "_rowMetadata",
                    "columnMetadata",
                    "headerValues",
                    "_rowNumber",
                    "_rawData",
                  ]);
                });
                return _context4.abrupt("return", trimmedRows);

              case 9:
                _context4.prev = 9;
                _context4.t0 = _context4["catch"](1);

                Promise.reject(new Error(_context4.t0));

              case 12:
              case "end":
                return _context4.stop();
            }
          }
        },
        _callee4,
        undefined,
        [[1, 9]]
      );
    })
  );

  return function getRows(_x8) {
    return _ref4.apply(this, arguments);
  };
})();

var cleanRows = function cleanRows(rows) {
  var columnTypes = guessColumnsDataTypes(rows);
  return rows.map(function (r) {
    return _.chain(r)
      .mapKeys(function (v, k) {
        return _.camelCase(k);
      })
      .mapValues(function (val, key) {
        switch (columnTypes[key]) {
          case "number":
            return Number(val.replace(/,/g, ""));
          case "boolean":
            // when column contains null we return null, otherwise check boolean value
            return val === null ? null : val === "TRUE";
          default:
            return val;
        }
      })
      .value();
  });
};

var guessColumnsDataTypes = function guessColumnsDataTypes(rows) {
  return _.flatMap(rows, function (r) {
    return _.chain(r)
      .omit(["_xml", "app:edited", "save", "del", "_links"])
      .mapKeys(function (v, k) {
        return _.camelCase(k);
      })
      .mapValues(function (val) {
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
      })
      .value();
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

var fetchData = (function () {
  var _ref = (0, _asyncToGenerator3.default)(
    /*#__PURE__*/ _regenerator2.default.mark(function _callee(
      spreadsheetId,
      worksheetTitle,
      credentials
    ) {
      var spreadsheet, worksheet, rows;
      return _regenerator2.default.wrap(
        function _callee$(_context) {
          while (1) {
            switch ((_context.prev = _context.next)) {
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
        },
        _callee,
        undefined
      );
    })
  );

  return function fetchData(_x2, _x3, _x4) {
    return _ref.apply(this, arguments);
  };
})();

exports.cleanRows = cleanRows;
exports.guessColumnsDataTypes = guessColumnsDataTypes;
exports.default = fetchData;

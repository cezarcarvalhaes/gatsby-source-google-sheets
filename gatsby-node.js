"use strict";

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var fetchSheet = require(`./fetch-sheet.js`).default;
var _ = require("lodash");

exports.sourceNodes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)( /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref, _ref2) {
    var boundActionCreators = _ref.boundActionCreators,
        createContentDigest = _ref.createContentDigest,
        createNodeId = _ref.createNodeId;
    var spreadsheetId = _ref2.spreadsheetId,
        worksheetTitle = _ref2.worksheetTitle,
        credentials = _ref2.credentials;
    var createNode, rows;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            createNode = boundActionCreators.createNode;

            console.log("FETCHING SHEET");
            _context.next = 4;
            return fetchSheet(spreadsheetId, worksheetTitle, credentials);

          case 4:
            rows = _context.sent;

            console.log(`${rows.length} rows returned from ${worksheetTitle}.`);
            rows.forEach(function (r) {
              var nodeData = {
                id: createNodeId(`"gsheet"-${JSON.stringify(r)}-${i}`),
                parent: "__SOURCE__",
                children: []
              };
              createNode(Object.assign(r, (0, _extends3.default)({}, nodeData, {
                internal: {
                  type: _.camelCase(`googleSheet ${worksheetTitle} row`),
                  contentDigest: createContentDigest(nodeData)
                }
              })));
            });

          case 7:
          case "end":
            return _context.stop();
        }
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();
"use strict";

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault2(_extends2);

function _interopRequireDefault2(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _asyncToGenerator2 = require("babel-runtime/helpers/asyncToGenerator");

var _asyncToGenerator3 = _interopRequireDefault(_asyncToGenerator2);

function _interopRequireDefault(obj) {
  return obj && obj.__esModule ? obj : { default: obj };
}

var fetchSheet = require(`./fetch-sheet.js`).default;
var _ = require("lodash");

exports.sourceNodes = function () {
  var _ref3 = (0, _asyncToGenerator3.default)(
  /*#__PURE__*/_regenerator2.default.mark(function _callee(_ref, _ref2) {
    var createNodeId = _ref.createNodeId,
        createContentDigest = _ref.createContentDigest;

    var boundActionCreators = _ref.boundActionCreators,
        getNode = _ref.getNode,
        store = _ref.store,
        cache = _ref.cache;
    var spreadsheetId = _ref2.spreadsheetId,
        worksheetTitle = _ref2.worksheetTitle,
        credentials = _ref2.credentials;
    var createNode, rows;
    return _regenerator2.default.wrap(function _callee$(_context) {
      while (1) {
        var _ret = function () {
          switch (_context.prev = _context.next) {
            case 0:
              createNode = boundActionCreators.createNode;

              console.log("FETCHING SHEET");
              _context.next = 4;
              return {
                v: fetchSheet(spreadsheetId, worksheetTitle, credentials)
              };

            case 4:
              rows = _context.sent;
              console.log(`${rows.length} rows returned from ${worksheetTitle}.`);
              var i = 0;
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
                i += 1;
              });

            case 6:
            case "end":
              return {
                v: _context.stop()
              };
          }
        }();

        if (typeof _ret === "object") return _ret.v;
      }
    }, _callee, undefined);
  }));

  return function (_x, _x2) {
    return _ref3.apply(this, arguments);
  };
}();
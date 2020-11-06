// @flow
const GoogleSpreadsheet = require("google-spreadsheet");
const _ = require("lodash");

const getSpreadsheet = async (spreadsheetId, credentials) => {
  try {
    const doc = new GoogleSpreadsheet(spreadsheetId);
    await doc.useServiceAccountAuth(credentials);
    return doc;
  } catch (error) {
    Promise.reject(error);
  }
};

const getWorksheetByTitle = (spreadsheet, worksheetTitle) => {
  try {
    await spreadsheet.loadInfo();
    const targetSheet = spreadsheet.sheetsByTitle[worksheetTitle];
     if (!(!targetSheet || typeof targetSheet === "undefined")) {
      Promise.reject(new Error(`Found no worksheet with the title ${worksheetTitle}`));
      return;
     }
     return targetSheet;
  } catch (error) {
    Promise.reject(error);
  }
}

const getRows = (worksheet, options = {}) => {
  try {
    const rows = await worksheet.getRows(options);
    return rows;
  } catch (error) {
    Promise.reject(error);
  }
}

const cleanRows = (rows) => {
  const columnTypes = guessColumnsDataTypes(rows);
  return rows.map((r) =>
    _.chain(r)
      .omit(["_sheet", "_rawProperties", "_cells", "_rowMetadata", "columnMetadata", "headerValues", "_rowNumber", "_rawData"])
      .mapKeys((v, k) => _.camelCase(k))
      .mapValues((val, key) => {
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
      .value()
  );
};

const guessColumnsDataTypes = (rows) =>
  _.flatMap(rows, (r) =>
    _.chain(r)
      .omit(["_sheet", "_rawProperties", "_cells", "_rowMetadata", "columnMetadata", "headerValues", "_rowNumber", "_rawData"])
      .mapKeys((v, k) => _.camelCase(k))
      .mapValues((val) => {
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
      .value()
  ).reduce((columnTypes, row) => {
    _.forEach(row, (type, columnName) => {
      // skip nulls, they should have no effect
      if (type === "null") {
        return;
      }

      const currentTypeCandidate = columnTypes[columnName];
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

const fetchData = async (spreadsheetId, worksheetTitle, credentials) => {
  const spreadsheet = await getSpreadsheet(spreadsheetId, credentials);
  const worksheet = await getWorksheetByTitle(spreadsheet, worksheetTitle);
  const rows = await getRows(worksheet);
  return cleanRows(rows);
};

export { cleanRows, guessColumnsDataTypes };
export default fetchData;

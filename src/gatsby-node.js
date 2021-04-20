const fetchSheet = require(`./fetch-sheet.js`).default;
const _ = require("lodash");

exports.sourceNodes = async (
  { actions, createContentDigest, createNodeId },
  { spreadsheetId, worksheetTitle, credentials }
) => {
  const { createNode } = actions;
  console.log("FETCHING SHEET");
  let rows = await fetchSheet(spreadsheetId, worksheetTitle, credentials);
  console.log(`${rows.length} rows returned from ${worksheetTitle}.`);
  let i = 0;
  rows.forEach((r) => {
    const nodeData = {
      id: createNodeId(`"gsheet"-${JSON.stringify(r)}-${i}`),
      parent: "__SOURCE__",
      children: [],
    };
    createNode(
      Object.assign(r, {
        ...nodeData,
        internal: {
          type: _.camelCase(`googleSheet ${worksheetTitle} row`),
          contentDigest: createContentDigest(nodeData),
        },
      })
    );
    i += 1;
  });
};

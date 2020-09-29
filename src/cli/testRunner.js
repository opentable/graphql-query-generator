const { queryClient } = require("../graphqlClient");
const QueryGenerator = require("../queryGenerator");
const { forEachSeries } = require("p-iteration");

async function runGraphQLTests(url, progressCallback) {

  const queryGenerator = new QueryGenerator(url);

  let responseData = {};

  const reportData = [];

  const { queries } = await queryGenerator.run();

  await forEachSeries(queries, async (item) => {
    const report = {
      ...item,
      queryName: parseQueryName(item.query),
      querySignature: parseQuerySignature(item.query),
      errors: [],
      status: "in progress",
    };

    try {
      progressCallback && progressCallback(report.queryName, 0, queries.length)
      
      // Look for parameter $mytrack.audio.name and extract it
      const pluggedInQuery = parseParameter(item.query);

      const res = await queryClient(url, pluggedInQuery);

      const response = await res.json();

      const hasErrors = response.errors;

      if (hasErrors) {
        response.errors.map((error) => logErrorToReport(report, error));
      } else {
        // Store responses in memory so they can be used for an argument to another query/mutation call
        responseData = { ...responseData, ...response.data };
        report.status = "passed";
      }
    } catch (error) {
      logErrorToReport(report, error);
    }
    progressCallback && progressCallback(report.queryName, 1, queries.length)
    reportData.push(report);
  });

  return reportData;
}

function parseParameter(query){
  const regex = /(\$[^")]*)/;

  let matches;
    if ((matches = regex.exec(query)) !== null) {
      const match = matches[0];
      const param = match.replace("$", "");
      // Eval using parameter against responseData to get value to plugin
      try {
        const value = eval("responseData." + param);
        // Replace $ parameter with actual value
        pluggedInQuery = pluggedInQuery.replace(match, value);
        return pluggedInQuery;
      } catch {
        throw Error("could not find " + match);
      }
    }
    return query;
}

function logErrorToReport(report, error) {
  const errorMessage = error.message || error;
  report.errors.push(errorMessage);
  report.status = "failed";
  // console.log(error);
}


function parseQueryName(query) {
  const regex = /\w*/;

  let matches;

  if ((matches = regex.exec(query)) !== null) {
    return matches[0];
  }

  return null;
}

function parseQuerySignature(query) {
  const regex = /{\s*([\w @:"'.,$()]*)/;

  let matches;

  if ((matches = regex.exec(query)) !== null) {
    return matches[1];
  }

  return null;
}


module.exports.runGraphQLTests = runGraphQLTests;
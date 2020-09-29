const { queryClient, mutationClient } = require("../graphqlClient");
const QueryGenerator = require("../queryGenerator");
const { forEachSeries } = require("p-iteration");

async function runGraphQLTests(url, progressCallback) {

  const queryGenerator = new QueryGenerator(url);

  let responseData = {};

  const reportData = [];

  const { queries, mutations } = await queryGenerator.run();

  await forEachSeries(queries, async (query) => {
    const report = {
      query: query,
      queryName: parseQueryName(query),
      errors: [],
      status: "in progress",
    };
    let pluggedInQuery = query;
    // Look for parameter $mytrack.audio.name and extract it
    let matches;
    if ((matches = regex.exec(query)) !== null) {
      const match = matches[0];
      const param = match.replace("$", "");
      // Eval using parameter against responseData to get value to plugin
      try {
        const value = eval("responseData." + param);
        // Replace $ parameter with actual value
        pluggedInQuery = pluggedInQuery.replace(match, value);
        report.query = pluggedInQuery;
      } catch {
        logErrorToReport(report, "could not find " + match);
      }
    }

    try {
      progressCallback && progressCallback(report.queryName, 0, queries.length)
      // formatQuery(pluggedInQuery);
      const res = await queryClient(url, pluggedInQuery);

      const response = await res.json();

      const hasErrors = response.errors;

      progressCallback && progressCallback(report.queryName, 1, queries.length)

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
    reportData.push(report);
  });

  return reportData;
}

function logErrorToReport(report, error) {
  const errorMessage = error.message || error;
  report.errors.push(errorMessage);
  report.status = "failed";
  // console.log(error);
}

module.exports.runGraphQLTests = runGraphQLTests;
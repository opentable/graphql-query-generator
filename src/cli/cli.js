const { query: queryService } = require("../graphqlClient");
const chalk = require("chalk");
const retry = require("./retryHelper").retry;
const QueryGenerator = require("../queryGenerator");
const { forEachSeries } = require("p-iteration");

var term = require("terminal-kit").terminal;

let progressBar;

process.title = "gql-query-generator";

const program = require("commander");

let serverUrl = null;
const regex = /(\$[^")]*)/;

async function main() {
  program
    .version(require("../../package.json").version)
    .arguments("<serverUrl>")
    .action(function (url) {
      serverUrl = url;
    })
    .option("-v, --verbose", "Displays all the query information")
    .option("-p, --parallel", "Executes all queries in parallel")
    .option(
      "-r, --retryCount <n>",
      "Number of times to retry the query generator if it fails",
      parseInt
    )
    .option(
      "-t, --retrySnoozeTime <n>",
      "Time in milliseconds to wait before retries",
      parseInt
    )
    .parse(process.argv);

  if (serverUrl === null) {
    console.log("Please specify the graphql endpoint for the serverUrl");
    program.outputHelp();
    process.exit(1);
  }

  const queryGenerator = new QueryGenerator(serverUrl);

  let responseData = {};

  const reportData = [];

  const { queries, coverage } = await queryGenerator.run();

  progressBar = term.progressBar({
    width: 120,
    title: "GraphQL API Tests:",
    eta: false,
    percent: true,
    items: queries.length,
  });

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
      progressBar.startItem(report.queryName);
      // formatQuery(pluggedInQuery);
      const res = await queryService(serverUrl, pluggedInQuery);

      const response = await res.json();

      const hasErrors = response.errors;

      progressBar.itemDone(report.queryName);

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

  term.bold("\n\nMusic\n\n");
  // term.defaultColor("Annotations");
  // term.right(2);
  term.table(
    reportData.map((report) => [
      report.status === "passed" ? "^G√" : "",
      `^${report.status === "passed" ? "-" : "R"}${parseQuerySignature(
        report.query
      )}${report.status === "passed" ? "" : `\n\n${report.errors[0]}\n\n`}`,
    ]),
    {
      hasBorder: false,
      contentHasMarkup: true,
      textAttr: { bgColor: "default" },
      width: 150,
      fit: true, // Activate all expand/shrink + wordWrap
    }
  );

  const failedTests = reportData.filter((report) => report.status === "failed")
    .length;
  const passedTests = reportData.filter((report) => report.status === "passed")
    .length;

  term.green("\n" + passedTests + " passing\n");
  term.red(failedTests + " failing\n\n");

  // if (failedTests > 0) {
  //   console.log(
  //     chalk.bold.red(
  //       `${failedTests}/${failedTests + passedTests} queries failed.`
  //     )
  //   );
  //   console.log(formatCoverageData(coverage));
  // }

  // console.log(chalk.bold.green(`\n${passedTests} tests passed.`));
  // console.log(formatCoverageData(coverage));
}
main();

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

function logErrorToReport(report, error) {
  const errorMessage = error.message || error;
  report.errors.push(errorMessage);
  report.status = "failed";
  // console.log(error);
}

function formatCoverageData(coverage) {
  const coveragePercentage = (coverage.coverageRatio * 100).toFixed(2);
  return `
=======================================
Overall coverage: ${coveragePercentage}%
---------------------------------------
Fields not covered by queries:

${coverage.notCoveredFields.join("\n")}
---------------------------------------
Overall coverage: ${coveragePercentage}%
`;
}

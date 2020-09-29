const { runGraphQLTests } = require("./testRunner");
const chalk = require("chalk");
const retry = require("./retryHelper").retry;

var term = require("terminal-kit").terminal;

let progressBar;

process.title = "gql-query-generator";

const program = require("commander");

let serverUrl = null;

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

  const reportData = await runGraphQLTests(serverUrl, (name, percentComplete, totalQueries) => {
    if(!progressBar) {
    progressBar = term.progressBar({
      width: 120,
      title: "GraphQL API Tests:",
      eta: false,
      percent: true,
      items: totalQueries,
    });
  }

    if(percentComplete === 0){
      progressBar.startItem(name);
    } 
    if(percentComplete === 1) {
      progressBar.itemDone(name);
    }
  });

  term.bold("\n\APIs\n\n");
  term.table(
    reportData.map((report) => [
      report.status === "passed" ? "^G√" : "",
      `^${report.status === "passed" ? "-" : "R"}${report.querySignature}${report.status === "passed" ? "" : `\n\n${report.errors[0]}\n\n`}`,
    ]),
    {
      hasBorder: false,
      contentHasMarkup: true,
      textAttr: { bgColor: "default" },
      width: 150,
      fit: true,
    }
  );

  const failedTests = reportData.filter((report) => report.status === "failed")
    .length;
  const passedTests = reportData.filter((report) => report.status === "passed")
    .length;

  term.green("\n" + passedTests + " passing\n");
  term.red(failedTests + " failing\n\n");
}

main();


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

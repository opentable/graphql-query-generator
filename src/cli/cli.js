var commander_1 = require('commander');
var terminal_kit_1 = require('terminal-kit');
var program = new commander_1.Command();
var progressBar;
process.title = 'gql-query-generator';
var serverUrl = '';
async;
function main() {
    program
        .version(require('../../package.json').version)
        .arguments('<serverUrl>')
        .action(function (url) {
        serverUrl = url;
    })
        .option('-v, --verbose', 'Displays all the query information')
        .option('-p, --parallel', 'Executes all queries in parallel')
        .option('-r, --retryCount <n>', 'Number of times to retry the query generator if it fails', parseInt)
        .option('-t, --retrySnoozeTime <n>', 'Time in milliseconds to wait before retries', parseInt)
        .parse(process.argv);
    if (serverUrl === null) {
        console.log('Please specify the graphql endpoint for the serverUrl');
        program.outputHelp();
        process.exit(1);
    }
    var reportData = await, runGraphQLTests = (serverUrl, function (name, percentComplete, totalQueries) {
        if (!progressBar) {
            progressBar = terminal_kit_1.terminal.progressBar({
                width: 80,
                title: 'GraphQL API Tests:',
                eta: true,
                percent: true,
                items: totalQueries
            });
        }
        if (percentComplete === 0) {
            progressBar.startItem(name);
        }
        if (percentComplete === 1) {
            progressBar.itemDone(name);
        }
    });
    terminal_kit_1.terminal.bold('\n\nAPIs\n\n');
    terminal_kit_1.terminal.table(reportData.map(function (report) { return [
        report.status === 'passed' && report.run.meetsSLA ? '^G√ ' : '',
        ("^" + (report.status === 'passed' && report.run.meetsSLA ? '-' : 'R') + report.query.signature + " " + (report.status === 'passed' && report.run.meetsSLA
            ? ''
            : "\n\n" + (report.errors.length ? report.errors[0] + '\n' : '') + (!report.run.meetsSLA ? "SLA response time " + report.query.sla.responseTime + "ms exceeded" : '') + "\n\n" + (report.errors.length ? report.query.pluggedInQuery + '\n\n' : ''))),
        ("" + (report.run.meetsSLA ? '^G' : '^R') + report.run.ms + "ms "),
    ]; }), {
        hasBorder: false,
        contentHasMarkup: true,
        textAttr: { bgColor: 'default' },
        width: 80,
        fit: true
    });
    var failedTests = reportData.filter(function (report) { return report.status === 'failed' || !report.run.meetsSLA; }).length;
    var passedTests = reportData.filter(function (report) { return report.status === 'passed' && report.run.meetsSLA; }).length;
    terminal_kit_1.terminal.green("\n" + passedTests + " passing\n");
    terminal_kit_1.terminal.red(failedTests + " failing\n\n");
}
main();
function formatCoverageData(coverage) {
    var coveragePercentage = (coverage.coverageRatio * 100).toFixed(2);
    return "\n=======================================\nOverall coverage: " + coveragePercentage + "%\n---------------------------------------\nFields not covered by queries:\n\n" + coverage.notCoveredFields.join('\n') + "\n---------------------------------------\nOverall coverage: " + coveragePercentage + "%\n";
}

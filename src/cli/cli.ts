import { runGraphQLTests } from './testRunner';
import { mockPlaylistServer } from '../test/mockServer';
import { Command } from 'commander';
import { terminal as term } from 'terminal-kit';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../package.json');

const program = new Command();

let progressBar;

process.title = 'graphql-service-tester';

async function main() {
  let serverUrl;
  program
    .version(version)
    .arguments('<serverUrl>')
    .action((url) => {
      serverUrl = url;
    })
    .option('-v, --verbose', 'Displays all the query information')
    // TODO: Add support back for running in some in parallel while preserving dependency ordering
    // .option('-p, --parallel', 'Executes all queries in parallel')
    // TODO: Add back support for retries
    // .option('-r, --retryCount <n>', 'Number of times to retry the query generator if it fails', parseInt)
    // .option('-t, --retrySnoozeTime <n>', 'Time in milliseconds to wait before retries', parseInt)
    .parse(process.argv);

  let server;

  if (serverUrl === 'playlist') {
    console.log('Using local mock playlist service for testing');
    server = mockPlaylistServer();
  }

  const reportData = await runGraphQLTests(server || serverUrl, (name, percentComplete, totalQueries) => {
    if (!progressBar) {
      progressBar = term.progressBar({
        title: 'GraphQL API Tests:',
        eta: true,
        percent: true,
        items: totalQueries,
      });
    }

    if (percentComplete === 0) {
      progressBar.startItem(name);
    }
    if (percentComplete === 1) {
      progressBar.itemDone(name);
    }
  });
  term.bold('\n\nAPIs\n\n');
  term.table(
    reportData.map((report) => [
      report.status === 'passed' && report.run.meetsSLA ? '^G√ ' : '',
      `^${report.status === 'passed' && report.run.meetsSLA ? 'R' : 'R'}${
        report.query.signature || report.query.query
      } ${
        report.status === 'passed' && report.run.meetsSLA && !program.verbose
          ? ''
          : `${report.errors.length ? '\n\n' + report.errors[0] + '\n' : ''}${
              !report.run.meetsSLA ? `\n\nSLA response time ${report.query.sla.responseTime}ms exceeded\n` : ''
            }`
      }\n`,
      `${report.run.meetsSLA ? '^G' : '^R'}${report.run.ms}ms `,
    ]),
    {
      hasBorder: false,
      contentHasMarkup: true,
      textAttr: { bgColor: 'default' },
      fit: true,
    }
  );

  const failedTests = reportData.filter((report) => report.status === 'failed' || !report.run.meetsSLA).length;
  const passedTests = reportData.filter((report) => report.status === 'passed' && report.run.meetsSLA).length;

  term.green(`\n${passedTests} passing\n`);
  term.red(`${failedTests} failing\n\n`);

  process.exitCode = failedTests > 0 ? 1 : 0;
}

main();

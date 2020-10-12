import { runGraphQLTests } from './testRunner';
import { Command } from 'commander';
import { terminal as term } from 'terminal-kit';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version } = require('../../package.json');

const program = new Command();

let progressBar;

process.title = 'gql-query-generator';

let serverUrl = '';

async function main() {
  program
    .version(version)
    .arguments('<serverUrl>')
    .action((url) => {
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

  const reportData = await runGraphQLTests(serverUrl, (name, percentComplete, totalQueries) => {
    if (!progressBar) {
      progressBar = term.progressBar({
        width: 80,
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
      `^${report.status === 'passed' && report.run.meetsSLA ? '-' : 'R'}${report.query.signature} ${
        report.status === 'passed' && report.run.meetsSLA
          ? ''
          : `\n\n${report.errors.length ? report.errors[0] + '\n' : ''}${
              !report.run.meetsSLA ? `SLA response time ${report.query.sla.responseTime}ms exceeded` : ''
            }\n\n${report.errors.length ? report.query.pluggedInQuery + '\n\n' : ''}`
      }`,
      `${report.run.meetsSLA ? '^G' : '^R'}${report.run.ms}ms `,
    ]),
    {
      hasBorder: false,
      contentHasMarkup: true,
      textAttr: { bgColor: 'default' },
      width: 80,
      fit: true,
    }
  );

  const failedTests = reportData.filter((report) => report.status === 'failed' || !report.run.meetsSLA).length;
  const passedTests = reportData.filter((report) => report.status === 'passed' && report.run.meetsSLA).length;

  term.green(`\n${passedTests} passing\n`);
  term.red(`${failedTests} failing\n\n`);
}

main();

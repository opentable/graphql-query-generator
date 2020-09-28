#!/usr/bin/env node
const {mutationClient, queryClient} = require('../graphqlClient');
const chalk = require('chalk');
const retry = require('./retryHelper').retry;
const QueryGenerator = require('../queryGenerator');

process.title = 'gql-query-generator';

let program = require('commander');

let serverUrl = null;

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

const queryGenerator = new QueryGenerator(serverUrl);

let failedTests = 0;
let passedTests = 0;
let retryCount = program.retryCount || 0;
let retrySnoozeTime = program.retrySnoozeTime || 1000;

retry(() => queryGenerator.run(), retryCount, retrySnoozeTime)
  .then(({ queries, qCoverage, mutations, mCoverage }) => {
    console.log(`Fetched ${queries.length} queries, get to work!`);
    console.log(`Fetched ${mutations.length} mutations, get to work!`);
    
    const getPromises = function(queries, client=queryClient){
      return queries.map(query =>
        client(serverUrl, query)
          .then((res) => res.json())
          .then((result) => {
            if (result.errors) {
              return Promise.reject(result);
            }

            if (program.verbose) {
              console.log(chalk.grey(query));
            }

            process.stdout.write('.');
            passedTests++;
          })
          .catch((result) => {
            console.log(chalk.red('FAIL'));
            if (result.errors) {
              console.log('Following errors occured:\n');
              result.errors.forEach(formatError);
              console.log('');
            }
            console.log(chalk.grey('Full query:\n', query));
            failedTests++;
          })
      )
    }

    const queryPromises = getPromises(queries, queryClient);
    const mutationPromises = getPromises(mutations, mutationClient);
    const allPromises = queryPromises.concat(mutationPromises);

    return maybeSerialisePromises(allPromises)
    .then(() => {
      if (failedTests > 0) {
        console.log(chalk.bold.red(`\n\n\n${failedTests}/${failedTests + passedTests} queries failed.\n`));
        console.log(formatCoverageData(qCoverage));
        return process.exit(1);
      }

      console.log(chalk.bold.green(`\nAll ${passedTests} tests passed.`))
      console.log(formatCoverageData(qCoverage));
    });
  })
  .catch((error) => {
    console.log(chalk.red(`\nFailed to get queries from server:\n${error}`));
    return process.exit(1);
  });

function formatError(err) {
  const pathMessage = err.path ? `\n\tPath: ${err.path.join('.')}` : ''
  return console.log(err.message + pathMessage);
}

function formatCoverageData(coverage) {
  const coveragePercentage = (coverage.coverageRatio * 100).toFixed(2);
  return `
=======================================
Overall coverage: ${coveragePercentage}%
---------------------------------------
Fields not covered by queries:

${coverage.notCoveredFields.join('\n')}
---------------------------------------
Overall coverage: ${coveragePercentage}%
`;
}

function maybeSerialisePromises(promises) {
  if (program.parallel) {
    return Promise.all(promises);
  }

  if (promises.length > 1) {
    return promises[0].then(() =>
      maybeSerialisePromises(promises.slice(1))
    );
  } else if (promises.length === 1) {
    return promises[0];
  }

  return Promise.resolve();
}
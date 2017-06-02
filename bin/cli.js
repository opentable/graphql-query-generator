#!/usr/bin/env node
const graphQlClient = require('../lib/graphqlClient');
const chalk = require('chalk');
process.title = 'gql-query-generator';

var program = require('commander');

let serverUrl = null;

program
  .version(require('../package.json').version)
  .arguments('<serverUrl>')
  .action(function (url) {
     serverUrl = url;
  })
  .option('-v, --verbose', 'Displays all the query information')
  .option('-p, --parallel', 'Executes all queries in parallel')
  .parse(process.argv);

  
if(serverUrl===null ) {
  console.log('Please specify the graphql endpoint for the serverUrl');
  program.outputHelp();
  process.exit(1);
}

const QueryGenerator = require('../lib/queryGenerator');

const queryGenerator = new QueryGenerator(serverUrl);

let failedTests = 0;
let passedTests = 0;

queryGenerator.run()
  .then(queries => {
    console.log(`Fetched ${queries.length} queries, get to work!`);
    
    return maybeSerialisePromises(
      queries.map(query => 
        graphQlClient(serverUrl, query)
          .then((res) => res.json())
          .then((result) => {
            if(result.errors) {
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
            if(result.errors) {
              console.log('Following errors occured:\n');
              result.errors.forEach(err => console.log(err.message));
              console.log('');
            }
            console.log(chalk.grey('Full query:\n',query));
            failedTests++;
          })
      )
    ).then(() => {
      if(failedTests > 0) {
        console.log(chalk.bold.red(`${failedTests}/${failedTests + passedTests} queries failed.`));
        return process.exit(1);
      }
      
      console.log(chalk.bold.green(`\nAll ${failedTests+passedTests} tests passed.`))
    });
  })
  .catch((error) => console.log(chalk.red(`\nFailed to get queries from server:\n${error}`)));


function maybeSerialisePromises(promises) {
  if(program.parallel) {
    return Promise.all(promises);
  }
  
  if(promises.length > 1) {
    return promises[0].then(() => 
      maybeSerialisePromises(promises.slice(1))
      );
  } else if (promises.length === 1) {
    return promises[0];
  }
  
  return Promise.resolve();
}
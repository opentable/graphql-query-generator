#!/usr/bin/env node
const graphQlClient = require('../lib/graphqlClient');
const colors = require('colors');
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
  .parse(process.argv);

  
if(serverUrl===null ) {
  console.log('Please specify the graphql endpoint for the serverUrl');
  program.outputHelp();
  process.exit(1);
}

// colors.setTheme({
//   silly: 'rainbow',
//   input: 'grey',
//   verbose: 'cyan',
//   prompt: 'grey',
//   info: 'green',
//   data: 'grey',
//   help: 'cyan',
//   warn: 'yellow',
//   debug: 'blue',
//   error: 'red'
// });

const QueryGenerator = require('../lib/queryGenerator');

const queryGenerator = new QueryGenerator(serverUrl);
queryGenerator.run()
  .then(queries => {
    console.log(`Fetched ${queries.length} queries, get to work!`);
    
    return Promise.all(
      queries.map(query => 
        graphQlClient(serverUrl, query)
          .then((res) => res.json())
          .then((result) => {
            if(result.errors) {
              return Promise.reject(result);
            }
            
            if (program.verbose) {
              console.log(query);
            }
            
            process.stdout.write('.');
          })
          .catch((result) => {
            console.log('FAIL'.error);
            if(result.errors) {
              console.log('There were some errors:\n');
              result.errors.forEach(err => console.log(err.message));
              console.log('');
            }
            console.log('Full query:\n',query);
          })
      )
    ).then(() => console.log(colors.green('all done')));
  })
  .catch((error) => console.log(`Failed to get queries from server:\n${error}`));

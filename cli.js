#!/usr/bin/env node
process.title = 'gql-query-generator';

const QueryGenerator = require('./queryGenerator');

const serverUrl = process.argv[2];
const queryGenerator = new QueryGenerator(serverUrl);
queryGenerator.run()
  .then(queries => {
    queries.forEach(query => {
      console.log(query);
      console.log('\n\n');
    });
  });

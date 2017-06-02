#!/usr/bin/env node
const graphQlClient = require('../lib/graphqlClient');
process.title = 'gql-query-generator';

console.log('THIS IS WORK IN PROGRESS, THINK TWICE BEFORE USING');

const QueryGenerator = require('../lib/queryGenerator');

const serverUrl = process.argv[2];
const queryGenerator = new QueryGenerator(serverUrl);
queryGenerator.run()
  .then(queries => {
    queries.forEach(query => {
      graphQlClient(serverUrl, query)
         .then(() => console.log('great success'))
         .catch(() => console.log('fake news'));
      console.log(query);
      console.log('\n\n');
    });
  });


const queryTreeToGraphQLString = require('./aqtToQuery');
const buildQueryTreeFromField = require('./schemaToQueryTree');
const _ = require('lodash');

module.exports = function schemaToQueries (rootName, schema) {
  const queries = [];
  const sharedSkipList = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryTree = buildQueryTreeFromField(field, schema, sharedSkipList);

    if (queryTree !== null) {
      queries.push(`{ ${queryTreeToGraphQLString(queryTree)} }`);
    }
  });

  return queries;
};

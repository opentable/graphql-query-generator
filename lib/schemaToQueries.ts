const queryTreeToGraphQLString = require('./aqtToQuery');
const buildQueryTreeFromField = require('./schemaToQueryTree').buildQueryTreeFromField;
const _ = require('lodash');

export default function schemaToQueries (rootName, schema) {
  const queries : Array<string> = [];
  const sharedSkipList = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryTree = buildQueryTreeFromField(field, schema, sharedSkipList);

    if (queryTree !== null) {
      queries.push(`{ ${queryTreeToGraphQLString(queryTree)} }`);
    }
  });

  return queries;
};

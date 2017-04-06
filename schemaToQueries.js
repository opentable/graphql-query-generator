const queryTreeToGraphQLString = require('./aqtToQuery');
const buildQueryTreeFromField = require('./schemaConverterForWizard');
const _ = require('lodash');

module.exports = function schemaToQueries (rootName, schema) {
  const queries = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryTree = buildQueryTreeFromField(field, schema);

    if (queryTree !== null) {
      queries.push(`{ ${queryTreeToGraphQLString(queryTree)} }`);
    }
  });

  return queries;
};

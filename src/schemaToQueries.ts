import queryTreeToGraphQLString from './aqtToQuery';
import schemaToQueryTree from './schemaToQueryTree';
import * as  _ from 'lodash';

export default function schemaToQueries (rootName, schema) {
  const queries : Array<string> = [];
  const sharedSkipList = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryTree = schemaToQueryTree.buildQueryTreeFromField(field, schema, sharedSkipList);

    if (queryTree !== null) {
      queries.push(`{ ${queryTreeToGraphQLString(queryTree)} }`);
    }
  });

  return queries;
};

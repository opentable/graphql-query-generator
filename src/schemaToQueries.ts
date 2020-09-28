import queryTreeToGraphQLString from './aqtToQuery';
import schemaToQueryTree from './schemaToQueryTree';
import * as  _ from 'lodash';

export default function schemaToQueries (rootName, schema) {
  const queries : Array<string> = [];
  const sharedSkipList = [];

  // Go through all the queries 
  /***
   * type Query {
   * 
   *  # Examples:
   *  # track(id: "9108955fe473f1640ac38b9c")
   *  track(id: ID!): Track
   * 
   *  # Examples:
   *  # playlist(id: "9108955fe473f1640ac38b9c")
   *  playlist(id: ID!): Playlist
   * 
   * }
   */
  _.forIn(schema[rootName].fields, (field) => {
    // Build the query to include all the available fields in the response
    /***
     * {
     *   track(id: "638eb16ccb4fa02cc8c59bb6") {
     *     id
     *     title
     *     ...
     *  }  
     * }
     */

    const queryTree = schemaToQueryTree.buildQueryTreeFromField(field, schema, sharedSkipList);

    if (queryTree !== null) {
      queries.push(`{ ${queryTreeToGraphQLString(queryTree)} }`);
    }
  });

  return queries;
};

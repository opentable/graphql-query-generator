var aqtToQuery_1 = require('./aqtToQuery');
var schemaToQueryTree_1 = require('./schemaToQueryTree');
var _ = require('lodash');
function schemaToQueries(rootName, schema) {
    var queries = [];
    var sharedSkipList = [];
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
    _.forIn(schema[rootName].fields, function (field) {
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
        var queryTree = schemaToQueryTree_1.buildQueryTreeFromField(field, schema, sharedSkipList);
        if (queryTree !== null) {
            // Handle array OR objects
            if (Array.isArray(queryTree)) {
                queries = queries.concat(queryTree.map(function (query) { return ("{ " + aqtToQuery_1["default"](query) + " }"); }));
            }
            else {
                for (var key in queryTree) {
                    var value = queryTree[key];
                    var query = "{ " + aqtToQuery_1["default"]((_a = {}, _a[key] = value, _a)) + " }";
                    queries.push(query);
                }
            }
        }
        var _a;
    });
    return queries;
}
exports["default"] = schemaToQueries;

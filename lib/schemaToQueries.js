"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aqtToQuery_1 = __importDefault(require("./aqtToQuery"));
const schemaToQueryTree_1 = require("./schemaToQueryTree");
const _ = __importStar(require("lodash"));
function schemaToQueries(rootName, schema) {
    let queries = [];
    if (rootName && schema[rootName]) {
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
            const queryTree = schemaToQueryTree_1.buildQueryTreeFromField(field, schema, sharedSkipList);
            if (queryTree !== null) {
                // Handle array OR objects
                if (Array.isArray(queryTree)) {
                    queries = queries.concat(queryTree.map((query) => `{ ${aqtToQuery_1.default(query)} }`));
                }
                else {
                    for (const key in queryTree) {
                        const value = queryTree[key];
                        const query = `{ ${aqtToQuery_1.default({ [key]: value })} }`;
                        queries.push(query);
                    }
                }
            }
        });
    }
    return queries;
}
exports.default = schemaToQueries;
//# sourceMappingURL=schemaToQueries.js.map
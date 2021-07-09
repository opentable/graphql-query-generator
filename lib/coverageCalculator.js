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
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
const schemaToQueryTree_1 = require("./schemaToQueryTree");
function coverageCalculator(rootName, schema) {
    if (!rootName || !schema[rootName]) {
        return {
            coverageRatio: 1,
            notCoveredFields: [],
        };
    }
    const sharedSkipListForGetQueryableFields = [];
    const sharedSkipListForGetAllFields = [];
    let allQuerableFields = [];
    let allAllFields = [];
    _.forIn(schema[rootName].fields, (field) => {
        const queryableFields = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.QUERYABLE_FIELDS, field, schema, sharedSkipListForGetQueryableFields);
        const allFields = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.ALL_FIELDS, field, schema, sharedSkipListForGetAllFields);
        allQuerableFields = _.union(allQuerableFields, queryableFields);
        allAllFields = _.union(allAllFields, allFields);
    });
    return {
        coverageRatio: allQuerableFields.length / allAllFields.length,
        notCoveredFields: _.difference(allAllFields, allQuerableFields),
    };
}
exports.default = coverageCalculator;
//# sourceMappingURL=coverageCalculator.js.map
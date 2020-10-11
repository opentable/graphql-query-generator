var _ = require('lodash');
var schemaToQueryTree_1 = require('./schemaToQueryTree');
/**
 * @example
 *   exports.default('ObjectContainingTwoDeeplyNestedObjects', require('../test/unit/mockData'))
 *   // => { coverageRatio: 1, notCoveredFields: []}
 *   exports.default('DeeplyNestedObjectWithPartialNoFollow', require('../test/unit/mockData'))
 *   // => { coverageRatio: 0.5, notCoveredFields: ["DeeplyNestedObject___NOFollowPart", "DeeplyNestedObject___DeeplyNestedObject___DeepNest", "DeeplyNestedObject___ObjectField___NotSoDeepNest"]}
 */
function coverageCalculator(rootName, schema) {
    var sharedSkipListForGetQueryableFields = [];
    var sharedSkipListForGetAllFields = [];
    var allQuerableFields = [];
    var allAllFields = [];
    _.forIn(schema[rootName].fields, function (field) {
        var queryableFields = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.QUERYABLE_FIELDS, field, schema, sharedSkipListForGetQueryableFields);
        var allFields = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.ALL_FIELDS, field, schema, sharedSkipListForGetAllFields);
        allQuerableFields = _.union(allQuerableFields, queryableFields);
        allAllFields = _.union(allAllFields, allFields);
    });
    return {
        coverageRatio: allQuerableFields.length / allAllFields.length,
        notCoveredFields: _.difference(allAllFields, allQuerableFields)
    };
}
exports["default"] = coverageCalculator;

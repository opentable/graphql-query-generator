const { getQuerableFields, getAllFields } = require('./schemaToQueryTree');
const _ = require('lodash');

/**
 * @example
 *   module.exports('ObjectContainingTwoDeeplyNestedObjects', require('../test/unit/mockData'))
 *   // => { coverageRatio: 1, notCoveredFields: []}
 *   module.exports('DeeplyNestedObjectWithPartialNoFollow', require('../test/unit/mockData'))
 *   // => { coverageRatio: 0.5, notCoveredFields: ["DeeplyNestedObject___NOFollowPart", "DeeplyNestedObject___DeeplyNestedObject___DeepNest", "DeeplyNestedObject___ObjectField___NotSoDeepNest"]}
 */
module.exports = function coverageCalculator (rootName, schema) {
  const sharedSkipListForGetQueryableFields = [];
  const sharedSkipListForGetAllFields = []

  let allQuerableFields = [];
  let allAllFields = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryableFields = getQuerableFields(field, schema, sharedSkipListForGetQueryableFields);
    const allFields = getAllFields(field, schema, sharedSkipListForGetAllFields);
    allQuerableFields = _.union(allQuerableFields, queryableFields);
    allAllFields = _.union(allAllFields, allFields);
  });

  return {
    coverageRatio: allQuerableFields.length / allAllFields.length,
    notCoveredFields: _.difference(allAllFields, allQuerableFields)
  };
};

import schemaToQueryTree  from './schemaToQueryTree';
import * as _ from 'lodash';

const { getQueryFields, getQueryFieldsModes } = schemaToQueryTree;

/**
 * @example
 *   exports.default('ObjectContainingTwoDeeplyNestedObjects', require('../test/unit/mockData'))
 *   // => { coverageRatio: 1, notCoveredFields: []}
 *   exports.default('DeeplyNestedObjectWithPartialNoFollow', require('../test/unit/mockData'))
 *   // => { coverageRatio: 0.5, notCoveredFields: ["DeeplyNestedObject___NOFollowPart", "DeeplyNestedObject___DeeplyNestedObject___DeepNest", "DeeplyNestedObject___ObjectField___NotSoDeepNest"]}
 */
export default function coverageCalculator (rootName, schema) {
  const sharedSkipListForGetQueryableFields = [];
  const sharedSkipListForGetAllFields = []

  let allQuerableFields = [];
  let allAllFields = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryableFields = getQueryFields(getQueryFieldsModes.QUERYABLE_FIELDS, field, schema, sharedSkipListForGetQueryableFields);
    const allFields = getQueryFields(getQueryFieldsModes.ALL_FIELDS, field, schema, sharedSkipListForGetAllFields);
    allQuerableFields = _.union(allQuerableFields, queryableFields);
    allAllFields = _.union(allAllFields, allFields);
  });

  return {
    coverageRatio: allQuerableFields.length / allAllFields.length,
    notCoveredFields: _.difference(allAllFields, allQuerableFields)
  };
};

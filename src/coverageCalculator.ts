import * as _ from 'lodash';
import { getQueryFields, getQueryFieldsModes } from './schemaToQueryTree';

export default function coverageCalculator(rootName, schema) {
  const sharedSkipListForGetQueryableFields = [];
  const sharedSkipListForGetAllFields = [];

  let allQuerableFields = [];
  let allAllFields = [];

  _.forIn(schema[rootName].fields, (field) => {
    const queryableFields = getQueryFields(
      getQueryFieldsModes.QUERYABLE_FIELDS,
      field,
      schema,
      sharedSkipListForGetQueryableFields
    );
    const allFields = getQueryFields(getQueryFieldsModes.ALL_FIELDS, field, schema, sharedSkipListForGetAllFields);
    allQuerableFields = _.union(allQuerableFields, queryableFields);
    allAllFields = _.union(allAllFields, allFields);
  });

  return {
    coverageRatio: allQuerableFields.length / allAllFields.length,
    notCoveredFields: _.difference(allAllFields, allQuerableFields),
  };
}

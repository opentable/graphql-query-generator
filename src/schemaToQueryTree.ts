import * as _ from 'lodash';
import * as graphql from 'graphql';
import descriptionParser from './descriptionParser';

const { getExamplesFrom, shouldFollow } = descriptionParser;

/**
 * @example
 *   isNotNullable({ type: { kind: 'NON_NULL' } }) // => true
 *   isNotNullable({
 *     type: {
 *       kind: 'LIST',
 *       ofType: { kind: 'NON_NULL' }
 *     }
 *   }) // => true
 *   isNotNullable({ type: { kind: 'OBJECT' } }) // => false
 */
function isNotNullable(arg) {
  const argType = arg.type.kind;

  if (argType === 'NON_NULL') {
    return true;
  }

  if (argType === 'LIST') {
    // we do not handle lists of lists of lists of lists
    return arg.type.ofType.kind === 'NON_NULL';
  }

  return false;
}

/**
 * @example
 *   getFields({
 *       type: { name: 'SomeTypeName' }
 *     }, {
 *       SomeTypeName: {
 *         fields: [{ name: 'f1' }, { name: 'f2' }]
 *       }
 *     }
 *   )
 *   // => [{ name: 'f1' }, { name: 'f2' }]
 */
function getFields(field, typeDictionary) {
  const typeName = magiclyExtractFieldTypeName(field);
  const allFields = typeDictionary[typeName].fields;
  // return _.filter(allFields, childField => !_.some(childField.args, isNotNullable));
  return allFields;
}

/**
 * @example
 *   getFieldNameOrExamplesIfNecessary({name: 'Name', args: []}) // => ['Name']
 *   getFieldNameOrExamplesIfNecessary({
 *    name: 'People',
 *    args: [{type:{kind: 'NON_NULL'}}],
 *    description: 'Examples: People(test: 1)'
 *   })
 *   // => ['People(test: 1)']
 *   getFieldNameOrExamplesIfNecessary({
 *    name: 'People',
 *    args: [{type:{kind: 'NULL'}}]
 *   })
 *   // => ['People']
 */
function getFieldNameOrExamplesIfNecessary(field) {
  if (!shouldFollow(field.description)) {
    return [];
  }

  if (!field.args || field.args.length === 0) {
    return [field.name];
  }

  const queries = getExamplesFrom(field.description);

  if (queries.length === 0) {
    if (_.some(field.args, isNotNullable)) {
      // ignore fields that have parameters, but we have not specified yet
      return [];
    }
    return [field.name];
  }

  return queries;
}

/**
 * @example
 *   magiclyExtractFieldTypeName({ type: { name: 'Person' } }) // => 'Person'
 *   magiclyExtractFieldTypeName({
 *     type: {
 *       name: 'NotMe',
 *       ofType: {
 *         name: 'MeNeither',
 *         ofType: { name: 'TestType' }
 *       }
 *     }
 *   })
 *   // => 'TestType'
 */
function magiclyExtractFieldTypeName(field) {
  let typeName = field.type.name;
  var ofType = field.type.ofType;
  while (ofType) {
    typeName = ofType.name;
    ofType = ofType.ofType;
  }

  return typeName;
}

/**
 * @example
 *   getSkipKey({ name: 'TypeName' }, { name: 'FieldName' }, { name: 'ParentTypeName' }) // => 'FieldName-TypeName-ParentTypeName'
 *   getSkipKey({ name: 'TypeName' }, { name: 'FieldName' }, null) // => 'FieldName-TypeName-ROOT'
 */
function getSkipKey(fieldTypeDefinition, field, parentFieldTypeDefinition) {
  const parentFieldTypeName = parentFieldTypeDefinition ? parentFieldTypeDefinition.name : 'ROOT';
  return `${field.name}-${fieldTypeDefinition.name}-${parentFieldTypeName}`;
}

const getQueryFieldsModes = {
  QUERYABLE_FIELDS: 'QUERYABLE_FIELDS',
  ALL_FIELDS: 'ALL_FIELDS'
};

export default {
  getQueryFieldsModes: getQueryFieldsModes,
  getQueryFields: function getQueryFields(mode, field, typeDictionary, visitedFields, isRoot = true, parentFieldTypeDefinition = null) {
    let queryFields : Array<string> = [];
    const fieldTypeName = magiclyExtractFieldTypeName(field);
    const fieldTypeDefinition = typeDictionary[fieldTypeName];
    if (isRoot) {
      queryFields.push(`${fieldTypeName}___${field.name}`);
      if (mode === getQueryFieldsModes.QUERYABLE_FIELDS) {
        const queriesBecauseRootAndWeDontKnowIfWeShouldStart = getFieldNameOrExamplesIfNecessary(field);
        if (queriesBecauseRootAndWeDontKnowIfWeShouldStart.length === 0) {
          return [];
        }
      }
    }

    if (fieldTypeDefinition.fields === null) { // isLeafType
      // Current field has already been added one step up recursion chain
      // so we do not need to add it again
      return queryFields;
    }

    if (fieldTypeDefinition.kind === 'OBJECT') {
      visitedFields.push(getSkipKey(fieldTypeDefinition, field, parentFieldTypeDefinition));
    }

    const allFields = getFields(field, typeDictionary);
    _.forIn(allFields, (childField) => {
      const childFieldTypeName = magiclyExtractFieldTypeName(childField);
      const childFieldType = typeDictionary[childFieldTypeName];
      const noOfPossibleQueries = getFieldNameOrExamplesIfNecessary(childField).length;
      const wasChildFieldAlreadyVisited = visitedFields.indexOf(getSkipKey(childFieldType, childField, fieldTypeDefinition)) >= 0;

      if (
        (noOfPossibleQueries > 0 || mode === getQueryFieldsModes.ALL_FIELDS) &&
        !wasChildFieldAlreadyVisited
      ) {
        queryFields.push(`${fieldTypeName}___${childFieldTypeName}___${childField.name}`);
        const subWalk = getQueryFields(mode, childField, typeDictionary, visitedFields, false, fieldTypeDefinition);
        queryFields = queryFields.concat(subWalk);
      }
    });

    return queryFields;
  },
  buildQueryTreeFromField: function buildQueryTreeFromField(field, typeDictionary, skipped : Array<string> = [], parentFieldTypeDefinition = null) {
    const fieldTypeName = magiclyExtractFieldTypeName(field);
    const fieldTypeDefinition = typeDictionary[fieldTypeName];

    // this are base invocations for all subsequent queries
    const queriesForRootField = getFieldNameOrExamplesIfNecessary(field);
    if (fieldTypeDefinition.fields === null) { // isLeafType
      if (queriesForRootField.length === 0) {
        return null;
      }

      return queriesForRootField;
    }

    if (fieldTypeDefinition.kind === 'OBJECT') {
      skipped.push(getSkipKey(fieldTypeDefinition, field, parentFieldTypeDefinition));
    }

    let queryNode : any | null = null;
    const allFields = getFields(field, typeDictionary);

    _.forIn(allFields, (childField) => {
      const childFieldTypeName = magiclyExtractFieldTypeName(childField);
      const childFieldType = typeDictionary[childFieldTypeName];

      if (skipped.indexOf(getSkipKey(childFieldType, childField, fieldTypeDefinition)) === -1) {
        queriesForRootField.forEach((rootFieldQuery) => {
          queryNode = queryNode || {};
          queryNode[rootFieldQuery] = queryNode[rootFieldQuery] || [];
          queryNode[rootFieldQuery].push(buildQueryTreeFromField(childField, typeDictionary, skipped, fieldTypeDefinition));
        });
      }
    });

    return queryNode;
  }
}

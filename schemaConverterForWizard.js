const _ = require('lodash');
const graphql = require('graphql');
const { getExamplesFrom, shouldFollow } = require('./descriptionParser');

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

function getFields(field, typeDictionary) {
  const typeName = magiclyExtractFieldTypeName(field);
  const allFields = typeDictionary[typeName].fields;
  // return _.filter(allFields, childField => !_.some(childField.args, isNotNullable));
  return allFields;
}

/**
 * @example
 *   getKeys({name: 'Name', args: []}) // => ['Name']
 *   getKeys({
 *    name: 'People',
 *    args: [{type:{kind: 'NON_NULL'}}],
 *    description: 'Examples: People(test: 1)'
 *   }) 
 *   // => ['People(test: 1)']
 *   getKeys({
 *    name: 'People',
 *    args: [{type:{kind: 'NULL'}}]
 *   }) 
 *   // => ['People']
 */
function getKeys(field) {
  if(!shouldFollow(field.description)) {
    return [];
  }

  if (field.args.length === 0) {
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

function magiclyExtractFieldTypeName(field) {
  let typeName = field.type.name;
  var ofType = field.type.ofType;
  while (ofType)
  {
    typeName = ofType.name;
    ofType = ofType.ofType;
  }

  return typeName;
}

function getSkipKey(fieldTypeDefinition, field) {
  return `${field.name}-${fieldTypeDefinition.name}`;
}

module.exports = function buildQueryTreeFromField(field, typeDictionary, skipped = []) {
  const fieldTypeName = magiclyExtractFieldTypeName(field);
  const fieldTypeDefinition = typeDictionary[fieldTypeName];

  if (fieldTypeDefinition.fields === null) { // isLeafType
    return field.name;
  }

  if (fieldTypeDefinition.kind === 'OBJECT') {
    skipped.push(getSkipKey(fieldTypeDefinition, field));
  }

  let queryNode = null;
  const keyNames = getKeys(field);
  const allFields = getFields(field, typeDictionary);

  _.forIn(allFields, (childField) => {
    const childFieldTypeName = magiclyExtractFieldTypeName(childField);
    const childFieldType = typeDictionary[childFieldTypeName];

    if (skipped.indexOf(getSkipKey(childFieldType, childField)) === -1) {
      keyNames.forEach((keyName) => {
        queryNode = queryNode || {};
        queryNode[keyName] = queryNode[keyName] || [];
        queryNode[keyName].push(buildQueryTreeFromField(childField, typeDictionary, skipped));
      });
    }
  });

  return queryNode;
};
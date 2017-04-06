const _ = require('lodash');
const graphql = require('graphql');

function getExamplesFrom(comment) {
  if(!comment) {
    return [];
  }
  const prefix = 'Examples:';
  const examples = comment
    .substring(comment.indexOf(prefix)).split('\n').slice(1).map(_.trim).filter(x=>x.length)[0];
  return examples ? [examples] : [];
}

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
  return _.filter(allFields, childField => !_.some(childField.args, isNotNullable));
}

function getKeys(field) {
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

module.exports = function buildQueryTreeFromField(field, typeDictionary, skipped = []) {
  const fieldTypeName = magiclyExtractFieldTypeName(field);
  const fieldTypeDefinition = typeDictionary[fieldTypeName];

  if (fieldTypeDefinition.fields === null) { // isLeafType
    return field.name;
  }

  if (fieldTypeDefinition.kind === 'OBJECT') {
    skipped.push(fieldTypeDefinition.name);
  }

  let queryNode = null;
  const keyNames = getKeys(field);
  const allFields = getFields(field, typeDictionary);

  _.forIn(allFields, (childField) => {
    const childFieldTypeName = magiclyExtractFieldTypeName(childField);
    const childFieldType = typeDictionary[childFieldTypeName];

    if (skipped.indexOf(childFieldType.name) === -1) {
      keyNames.forEach((keyName) => {
        queryNode = queryNode || {};
        queryNode[keyName] = queryNode[keyName] || [];
        queryNode[keyName].push(buildQueryTreeFromField(childField, typeDictionary, skipped));
      });
    }
  });

  return queryNode;
}
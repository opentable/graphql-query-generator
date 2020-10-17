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
exports.getQueryFields = exports.buildQueryTreeFromField = exports.getQueryFieldsModes = exports.getSkipKey = exports.magiclyExtractFieldTypeName = exports.getFieldNameOrExamplesIfNecessary = exports.getFields = exports.isNotNullable = void 0;
const _ = __importStar(require("lodash"));
const descriptionParser_1 = require("./descriptionParser");
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
exports.isNotNullable = isNotNullable;
function getFields(field, typeDictionary) {
    const typeName = magiclyExtractFieldTypeName(field);
    const allFields = typeDictionary[typeName].fields;
    // return _.filter(allFields, childField => !_.some(childField.args, isNotNullable));
    return allFields;
}
exports.getFields = getFields;
function getFieldNameOrExamplesIfNecessary(field) {
    if (!descriptionParser_1.shouldFollow(field.description)) {
        return [];
    }
    if (!field.args || field.args.length === 0) {
        return [field.name];
    }
    const queries = descriptionParser_1.getExamplesFrom(field.description);
    if (queries.length === 0) {
        if (_.some(field.args, isNotNullable)) {
            // ignore fields that have parameters, but we have not specified yet
            return [];
        }
        return [field.name];
    }
    return queries;
}
exports.getFieldNameOrExamplesIfNecessary = getFieldNameOrExamplesIfNecessary;
function magiclyExtractFieldTypeName(field) {
    let typeName = field.type.name;
    let ofType = field.type.ofType;
    while (ofType) {
        typeName = ofType.name;
        ofType = ofType.ofType;
    }
    return typeName;
}
exports.magiclyExtractFieldTypeName = magiclyExtractFieldTypeName;
function getSkipKey(fieldTypeDefinition, field, parentFieldTypeDefinition) {
    const parentFieldTypeName = parentFieldTypeDefinition ? parentFieldTypeDefinition.name : 'ROOT';
    return `${field.name}-${fieldTypeDefinition.name}-${parentFieldTypeName}`;
}
exports.getSkipKey = getSkipKey;
exports.getQueryFieldsModes = {
    QUERYABLE_FIELDS: 'QUERYABLE_FIELDS',
    ALL_FIELDS: 'ALL_FIELDS',
};
function buildQueryTreeFromField(field, typeDictionary, skipped = [], parentFieldTypeDefinition = null) {
    const fieldTypeName = magiclyExtractFieldTypeName(field);
    const fieldTypeDefinition = typeDictionary[fieldTypeName];
    // this are base invocations for all subsequent queries
    const queriesForRootField = getFieldNameOrExamplesIfNecessary(field);
    if (fieldTypeDefinition.fields === null) {
        // isLeafType
        if (queriesForRootField.length === 0) {
            return null;
        }
        return queriesForRootField;
    }
    if (fieldTypeDefinition.kind === 'OBJECT') {
        skipped.push(getSkipKey(fieldTypeDefinition, field, parentFieldTypeDefinition));
    }
    let queryNode = null;
    const allFields = getFields(field, typeDictionary);
    _.forIn(allFields, (childField) => {
        const childFieldTypeName = magiclyExtractFieldTypeName(childField);
        const childFieldType = typeDictionary[childFieldTypeName];
        if (true || skipped.indexOf(getSkipKey(childFieldType, childField, fieldTypeDefinition)) === -1) {
            queriesForRootField.forEach((rootFieldQuery) => {
                queryNode = queryNode || {};
                queryNode[rootFieldQuery] = queryNode[rootFieldQuery] || [];
                queryNode[rootFieldQuery].push(buildQueryTreeFromField(childField, typeDictionary, skipped, fieldTypeDefinition));
            });
        }
    });
    return queryNode;
}
exports.buildQueryTreeFromField = buildQueryTreeFromField;
function getQueryFields(mode, field, typeDictionary, visitedFields, isRoot = true, parentFieldTypeDefinition = null) {
    let queryFields = [];
    const fieldTypeName = magiclyExtractFieldTypeName(field);
    const fieldTypeDefinition = typeDictionary[fieldTypeName];
    if (isRoot) {
        queryFields.push(`${fieldTypeName}___${field.name}`);
        if (mode === exports.getQueryFieldsModes.QUERYABLE_FIELDS) {
            const queriesBecauseRootAndWeDontKnowIfWeShouldStart = getFieldNameOrExamplesIfNecessary(field);
            if (queriesBecauseRootAndWeDontKnowIfWeShouldStart.length === 0) {
                return [];
            }
        }
    }
    if (fieldTypeDefinition.fields === null) {
        // isLeafType
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
        if ((noOfPossibleQueries > 0 || mode === exports.getQueryFieldsModes.ALL_FIELDS) && !wasChildFieldAlreadyVisited) {
            queryFields.push(`${fieldTypeName}___${childFieldTypeName}___${childField.name}`);
            const subWalk = getQueryFields(mode, childField, typeDictionary, visitedFields, false, fieldTypeDefinition);
            queryFields = queryFields.concat(subWalk);
        }
    });
    return queryFields;
}
exports.getQueryFields = getQueryFields;
//# sourceMappingURL=schemaToQueryTree.js.map
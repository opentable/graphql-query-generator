"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const schemaToQueryTree_1 = require("./schemaToQueryTree");
describe('Schema to query tree', () => {
    it('isNonNullable Non null', () => {
        expect(schemaToQueryTree_1.isNotNullable({ type: { kind: 'NON_NULL' } })).toEqual(true);
    });
    it('isNonNullable List of non null', () => {
        expect(schemaToQueryTree_1.isNotNullable({
            type: {
                kind: 'LIST',
                ofType: { kind: 'NON_NULL' },
            },
        })).toEqual(true);
    });
    it('isNonNullable Object', () => {
        expect(schemaToQueryTree_1.isNotNullable({ type: { kind: 'OBJECT' } })).toEqual(false);
    });
    it('getFields', () => {
        expect(schemaToQueryTree_1.getFields({
            type: { name: 'SomeTypeName' },
        }, {
            SomeTypeName: {
                fields: [{ name: 'f1' }, { name: 'f2' }],
            },
        })).toEqual([{ name: 'f1' }, { name: 'f2' }]);
    });
    it('getFieldNameOrExamplesIfNecessary name', () => {
        expect(schemaToQueryTree_1.getFieldNameOrExamplesIfNecessary({ name: 'Name', args: [] })).toEqual(['Name']);
    });
    it('getFieldNameOrExamplesIfNecessary name and description', () => {
        expect(schemaToQueryTree_1.getFieldNameOrExamplesIfNecessary({
            name: 'People',
            args: [{ type: { kind: 'NON_NULL' } }],
            description: 'Examples: People(test: 1)',
        })).toEqual(['People(test: 1)']);
    });
    it('getFieldNameOrExamplesIfNecessary name and args', () => {
        expect(schemaToQueryTree_1.getFieldNameOrExamplesIfNecessary({
            name: 'People',
            args: [{ type: { kind: 'NULL' } }],
        })).toEqual(['People']);
    });
    it('magiclyExtractFieldTypeName Person', () => {
        expect(schemaToQueryTree_1.magiclyExtractFieldTypeName({ type: { name: 'Person' } })).toEqual('Person');
    });
    it('magiclyExtractFieldTypeName TestType', () => {
        expect(schemaToQueryTree_1.magiclyExtractFieldTypeName({
            type: {
                name: 'NotMe',
                ofType: {
                    name: 'MeNeither',
                    ofType: { name: 'TestType' },
                },
            },
        })).toEqual('TestType');
    });
    it('getSkipKey ParentTypeName', () => {
        expect(schemaToQueryTree_1.getSkipKey({ name: 'TypeName' }, { name: 'FieldName' }, { name: 'ParentTypeName' })).toEqual('FieldName-TypeName-ParentTypeName');
    });
    it('getSkipKey FieldName-TypeName-ROOT', () => {
        expect(schemaToQueryTree_1.getSkipKey({ name: 'TypeName' }, { name: 'FieldName' }, null)).toEqual('FieldName-TypeName-ROOT');
    });
});
//# sourceMappingURL=schemaToQueryTree.test.js.map
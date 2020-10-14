"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schemaToQueryTree_1 = require("./schemaToQueryTree");
const mockData_1 = __importDefault(require("./mockData"));
describe('Build query tree from field', () => {
    let typeDictionary;
    beforeEach(() => {
        typeDictionary = mockData_1.default;
    });
    it('should handle simple fields', () => {
        expect(schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ScalarField',
            },
            name: 'FetchParentField',
            args: [],
        }, typeDictionary)).toEqual(['FetchParentField']);
    });
    it('should handle simple objects', () => {
        const ignoreList = [];
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ObjectField',
            },
            name: 'MyObjectField',
            args: [],
        }, typeDictionary, ignoreList);
        expect(result.MyObjectField[0]).toEqual(['MyScalar']);
        expect(result.MyObjectField[1]).toEqual(['MyScalar2']);
        expect(ignoreList.length).toEqual(1);
        expect(ignoreList[0]).toEqual('MyObjectField-ObjectField-ROOT');
    });
    it('should handle nested objects', () => {
        const ignoreList = [];
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ObjectNestingOtherObject',
            },
            name: 'MyObjectWithNested',
            args: [],
        }, typeDictionary, ignoreList);
        expect(result.MyObjectWithNested[0]).toHaveProperty('NestedObject');
        expect(result.MyObjectWithNested[0].NestedObject[0]).toEqual(['MyScalar']);
        expect(result.MyObjectWithNested[0].NestedObject[1]).toEqual(['MyScalar2']);
        expect(result.MyObjectWithNested[1]).toEqual(['NestedScalar']);
        expect(ignoreList.length).toEqual(2);
        expect(ignoreList[0]).toEqual('MyObjectWithNested-ObjectNestingOtherObject-ROOT');
        expect(ignoreList[1]).toEqual('NestedObject-ObjectField-ObjectNestingOtherObject');
    });
    it('should handle circular dependencies', () => {
        const ignoreList = [];
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'DeeplyNestedObject',
            },
            name: 'MyCircle',
            args: [],
        }, typeDictionary, ignoreList);
        expect(result.MyCircle.length).toEqual(1);
        expect(result.MyCircle[0]).toHaveProperty('DeepNest');
        expect(result.MyCircle[0].DeepNest.length).toEqual(1);
        expect(result.MyCircle[0].DeepNest[0].NotSoDeepNest.length).toEqual(2);
        expect(result.MyCircle[0].DeepNest[0].NotSoDeepNest[0]).toEqual(['MyScalar']);
    });
    it('should handle very similar objects[test covering skipList naming bug]', () => {
        const ignoreList = [];
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ObjectContainingTwoDeeplyNestedObjects',
            },
            name: 'MyBug',
            args: [],
        }, typeDictionary, ignoreList);
        expect(result.MyBug.length).toEqual(2);
        expect(result.MyBug[0]).not.toBeNull();
        expect(result.MyBug[1]).not.toBeNull();
    });
    it('should not support default value for non nullable args[NOT IMPLEMENTED YET!]', () => {
        const arg = {
            defaultValue: '192.168.0.1',
            description: 'Comprehensive description.',
            name: 'ip',
            type: { kind: 'NON_NULL', name: null, ofType: { kind: 'SCALAR', name: 'String', ofType: null } },
        };
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ObjectField',
            },
            name: 'MyObjectField',
            args: [arg],
        }, typeDictionary);
        expect(result).toBeNull();
    });
    it('should use example from description for non nullable args', () => {
        const arg = {
            defaultValue: null,
            description: 'Comprehensive description.',
            name: 'ip',
            type: { kind: 'NON_NULL', name: null, ofType: { kind: 'SCALAR', name: 'String', ofType: null } },
        };
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ObjectField',
            },
            name: 'MyObjectField',
            args: [arg],
            description: 'Example: MyObjectField(ip: "192.168.0.1")',
        }, typeDictionary);
        expect(result['MyObjectField(ip: "192.168.0.1")'][0]).toEqual(['MyScalar']);
        expect(result['MyObjectField(ip: "192.168.0.1")'][1]).toEqual(['MyScalar2']);
    });
    it('should ignore nullable args', () => {
        const arg = {
            defaultValue: null,
            description: 'Comprehensive description.',
            name: 'ip',
            type: { kind: 'SCALAR', name: 'String', ofType: null },
        };
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ObjectField',
            },
            name: 'MyObjectField',
            args: [arg],
        }, typeDictionary);
        expect(result.MyObjectField[0]).toEqual(['MyScalar']);
        expect(result.MyObjectField[1]).toEqual(['MyScalar2']);
    });
    it('should ignore nullable args for SCALAR fields', () => {
        const arg = {
            defaultValue: null,
            description: 'Comprehensive description.',
            name: 'ip',
            type: { kind: 'SCALAR', name: 'String', ofType: null },
        };
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ScalarField',
            },
            name: 'MyScalar',
            args: [arg],
        }, typeDictionary);
        expect(result).toEqual(['MyScalar']);
    });
    it('should use single example from description for non-nullable args for SCALAR fields', () => {
        const arg = {
            defaultValue: null,
            description: 'Comprehensive description.',
            name: 'ip',
            type: { kind: 'NON_NULL', name: null, ofType: { kind: 'SCALAR', name: 'String', ofType: null } },
        };
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ScalarField',
            },
            name: 'MyScalar',
            args: [arg],
            description: 'Example: MyScalar(ip: "192.168.0.1")',
        }, typeDictionary);
        expect(result).toEqual(['MyScalar(ip: "192.168.0.1")']);
    });
    it('should use multiple examples from description for non-nullable args for SCALAR fields', () => {
        const arg = {
            defaultValue: null,
            description: 'Comprehensive description.',
            name: 'ip',
            type: { kind: 'NON_NULL', name: null, ofType: { kind: 'SCALAR', name: 'String', ofType: null } },
        };
        const result = schemaToQueryTree_1.buildQueryTreeFromField({
            type: {
                name: 'ScalarField',
            },
            name: 'MyScalar',
            args: [arg],
            description: 'Example: \nMyScalar(ip: "192.168.0.1")\nMyScalar(ip: "192.168.0.2")',
        }, typeDictionary);
        expect(result).toEqual(['MyScalar(ip: "192.168.0.1")', 'MyScalar(ip: "192.168.0.2")']);
    });
});
//# sourceMappingURL=schemaToQueryTreeBase.test.js.map
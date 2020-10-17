"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const schemaToQueryTree_1 = require("./schemaToQueryTree");
const mockData_1 = __importDefault(require("./mockData"));
describe('Build coverage', () => {
    let typeDictionary;
    beforeEach(() => {
        typeDictionary = mockData_1.default;
    });
    it('should be able to fetch all fields', () => {
        const result = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.ALL_FIELDS, {
            type: {
                name: 'DeeplyNestedObjectWithPartialNoFollow',
            },
            name: 'Test',
            args: [],
        }, typeDictionary, []);
        expect(result.length).toBe(9);
        expect(result.filter((r) => r.indexOf('NOFollowPart') > 0).length).toBe(1);
    });
    it('should be able to fetch only queryable fields', () => {
        const result = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.QUERYABLE_FIELDS, {
            type: {
                name: 'DeeplyNestedObjectWithPartialNoFollow',
            },
            name: 'Test',
            args: [],
        }, typeDictionary, []);
        expect(result.length).toBe(4);
        expect(result.filter((r) => r.indexOf('NOFollowPart') > 0).length).toBe(0);
    });
    it('should not return queryable fields if root object is not queryable', () => {
        const result = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.QUERYABLE_FIELDS, {
            name: 'NOFollowPart',
            type: { name: 'DeeplyNestedObject' },
            args: [
                {
                    name: 'ip',
                    description: '',
                    type: {
                        kind: 'NON_NULL',
                        name: null,
                        ofType: {
                            kind: 'SCALAR',
                            name: 'String',
                            ofType: null,
                        },
                    },
                    defaultValue: null,
                },
            ],
        }, typeDictionary, []);
        expect(result.length).toBe(0);
    });
});
//# sourceMappingURL=schemaToQueryTreeCodeCoverage.test.js.map
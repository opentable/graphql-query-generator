var schemaToQueryTree_1 = require('../../../src/schemaToQueryTree');
var mockData_1 = require('../mockData');
describe('Build coverage', function () {
    var typeDictionary;
    beforeEach(function () {
        typeDictionary = mockData_1["default"];
    });
    it('should be able to fetch all fields', function () {
        var result = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.ALL_FIELDS, {
            type: {
                name: 'DeeplyNestedObjectWithPartialNoFollow'
            },
            name: 'Test',
            args: []
        }, typeDictionary, []);
        expect(result.length).toBe(9);
        expect(result.filter(function (r) { return r.indexOf('NOFollowPart') > 0; }).length).toBe(1);
    });
    it('should be able to fetch only queryable fields', function () {
        var result = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.QUERYABLE_FIELDS, {
            type: {
                name: 'DeeplyNestedObjectWithPartialNoFollow'
            },
            name: 'Test',
            args: []
        }, typeDictionary, []);
        expect(result.length).toBe(4);
        expect(result.filter(function (r) { return r.indexOf('NOFollowPart') > 0; }).length).toBe(0);
    });
    it('should not return queryable fields if root object is not queryable', function () {
        var result = schemaToQueryTree_1.getQueryFields(schemaToQueryTree_1.getQueryFieldsModes.QUERYABLE_FIELDS, {
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
                            ofType: null
                        }
                    },
                    defaultValue: null
                },
            ]
        }, typeDictionary, []);
        expect(result.length).toBe(0);
    });
});

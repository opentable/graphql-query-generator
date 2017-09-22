const should = require('chai').should();
const { getQueryFields, getQueryFieldsModes } = require('../../../lib/schemaToQueryTree').default;
const mockData = require('../mockData');

describe('Build coverage', () => {
    let typeDictionary = null;

    beforeEach(() => {
        typeDictionary = mockData
    });

    it('should be able to fetch all fields', () => {
        const result = getQueryFields(
            getQueryFieldsModes.ALL_FIELDS,
            {
                type: {
                    name: 'DeeplyNestedObjectWithPartialNoFollow'
                },
                name: 'Test',
                args: []
            },
            typeDictionary,
            []
        );
        result.length.should.equal(9);
        result.filter(r => r.indexOf('NOFollowPart') > 0).length.should.equal(1);
    });

    it('should be able to fetch only queryable fields', () => {
        const result = getQueryFields(
            getQueryFieldsModes.QUERYABLE_FIELDS,
            {
                type: {
                    name: 'DeeplyNestedObjectWithPartialNoFollow'
                },
                name: 'Test',
                args: []
            },
            typeDictionary,
            []
        );
        result.length.should.equal(4);
        result.filter(r => r.indexOf('NOFollowPart') > 0).length.should.equal(0);
    });

    it('should not return querable fields if root object is not querable', () => {
        const result = getQueryFields(
            getQueryFieldsModes.QUERYABLE_FIELDS,
            {
                name: 'NOFollowPart',
                type: { name: 'DeeplyNestedObject' },
                args: [
                    {
                        "name": "ip",
                        "description": "",
                        "type": {
                            "kind": "NON_NULL",
                            "name": null,
                            "ofType": {
                                "kind": "SCALAR",
                                "name": "String",
                                "ofType": null
                            }
                        },
                        "defaultValue": null
                    }
                ]
            },
            typeDictionary,
            []);
        result.length.should.equal(0);
    });
});
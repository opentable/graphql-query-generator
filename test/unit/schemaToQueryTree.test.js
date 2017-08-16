const should = require('chai').should();
const buildQueryTreeFromField = require('../../lib/schemaToQueryTree');

describe('Build query tree from field', () => {
    let typeDictionary = null;

    beforeEach(() => {
        typeDictionary = {
            ScalarField: {
                name: 'ScalarField',
                kind: 'SCALAR',
                fields: null
            },
            ObjectField: {
                name: 'ObjectField',
                kind: 'OBJECT',
                fields: [
                    { name: 'MyScalar', type: { name: 'ScalarField' }, args: [] },
                    { name: 'MyScalar2', type: { name: 'ScalarField' }, args: [] }
                ]
            },
            ObjectNestingOtherObject: {
                name: 'ObjectNestingOtherObject',
                kind: 'OBJECT',
                fields: [
                    { name: 'NestedObject', type: { name: 'ObjectField' }, args: [] },
                    { name: 'NestedScalar', type: { name: 'ScalarField' }, args: [] }
                ]
            },
            DeeplyNestedObject: {
                name: 'DeeplyNestedObject',
                kind: 'OBJECT',
                fields: [
                    { name: 'DeepNest', type: { name: 'DeeplyNestedObject' }, args: [] },
                    { name: 'NotSoDeepNest', type: { name: 'ObjectField' }, args: [] }
                ]
            }
        };
    });

    it('should handle simple fields', () => {
        buildQueryTreeFromField({
            type: {
                name: 'ScalarField'
            },
            name: 'FetchParentField',
            args: []
        },
            typeDictionary
        ).should.equal('FetchParentField');
    });

    it('should handle simple objects', () => {
        const ignoreList = [];
        const result = buildQueryTreeFromField({
            type: {
                name: 'ObjectField'
            },
            name: 'MyObjectField',
            args: []
        },
            typeDictionary, ignoreList
        );
        result.MyObjectField[0].should.equal('MyScalar');
        result.MyObjectField[1].should.equal('MyScalar2');
        ignoreList.length.should.equal(1);
        ignoreList[0].should.equal('MyObjectField-ObjectField');
    });

    it('should handle nested objects', () => {
        const ignoreList = [];
        const result = buildQueryTreeFromField({
            type: {
                name: 'ObjectNestingOtherObject'
            },
            name: 'MyObjectWithNested',
            args: []
        },
            typeDictionary, ignoreList
        );
        result.MyObjectWithNested[0].should.include.all.keys('NestedObject');
        result.MyObjectWithNested[0].NestedObject[0].should.equal('MyScalar');
        result.MyObjectWithNested[0].NestedObject[1].should.equal('MyScalar2');
        result.MyObjectWithNested[1].should.equal('NestedScalar');
        ignoreList.length.should.equal(2);
        ignoreList[0].should.equal('MyObjectWithNested-ObjectNestingOtherObject');
        ignoreList[1].should.equal('NestedObject-ObjectField');
    });

    it('should handle circular dependencies', () => {
        const ignoreList = [];
        const result = buildQueryTreeFromField({
            type: {
                name: 'DeeplyNestedObject'
            },
            name: 'MyCircle',
            args: []
        },
            typeDictionary, ignoreList
        );
        result.MyCircle.length.should.equal(1);
        result.MyCircle[0].should.include.all.keys('DeepNest');
        result.MyCircle[0].DeepNest.length.should.equal(1);
        result.MyCircle[0].DeepNest[0].NotSoDeepNest.length.should.equal(2);
        result.MyCircle[0].DeepNest[0].NotSoDeepNest[0].should.equal('MyScalar');
    });

    it('should not support default value for non nullable args[NOT IMPLEMENTED YET!]', () => {
        const arg = {
            defaultValue: '192.168.0.1',
            description: "Comprehensive description.",
            name: "ip",
            type: {kind: "NON_NULL", name: null, ofType: {kind: "SCALAR", name: "String", ofType: null}}
        };
        const result = buildQueryTreeFromField({
            type: {
                name: 'ObjectField'
            },
            name: 'MyObjectField',
            args: [arg]
        },
            typeDictionary
        );

        should.equal(null, result);
    });

    it('should use example from description for non nullable args', () => {
        const arg = {
            defaultValue: null,
            description: "Comprehensive description.",
            name: "ip",
            type: {kind: "NON_NULL", name: null, ofType: {kind: "SCALAR", name: "String", ofType: null}}
        };
        const result = buildQueryTreeFromField({
            type: {
                name: 'ObjectField'
            },
            name: 'MyObjectField',
            args: [arg],
            description: 'Example: MyObjectField(ip: "192.168.0.1")'
        },
            typeDictionary
        );
        result['MyObjectField(ip: "192.168.0.1")'][0].should.equal('MyScalar');
        result['MyObjectField(ip: "192.168.0.1")'][1].should.equal('MyScalar2');
    });

    it('should ignore nullable args', () => {
        const arg = {
            defaultValue: null,
            description: "Comprehensive description.",
            name: "ip",
            type: {kind: "SCALAR", name: "String", ofType: null}
        };
        const result = buildQueryTreeFromField({
            type: {
                name: 'ObjectField'
            },
            name: 'MyObjectField',
            args: [arg]
        },
            typeDictionary
        );
        result.MyObjectField[0].should.equal('MyScalar');
        result.MyObjectField[1].should.equal('MyScalar2');
    });

    it('should ignore nullable args for SCALAR fields', () => {
        const arg = {
            defaultValue: null,
            description: "Comprehensive description.",
            name: "ip",
            type: {kind: "SCALAR", name: "String", ofType: null}
        };
        const result = buildQueryTreeFromField({
            type: {
                name: 'ScalarField'
            },
            name: 'MyScalar',
            args: [arg]
        },
            typeDictionary
        );
        result.should.equal('MyScalar');
    });

    it('should use single example from description for non-nullable args for SCALAR fields', () => {
        const arg = {
            defaultValue: null,
            description: "Comprehensive description.",
            name: "ip",
            type: {kind: "NON_NULL", name: null, ofType: {kind: "SCALAR", name: "String", ofType: null}}
        };
        const result = buildQueryTreeFromField({
            type: {
                name: 'ScalarField'
            },
            name: 'MyScalar',
            args: [arg],
            description: 'Example: MyScalar(ip: "192.168.0.1")'
        },
            typeDictionary
        );
        result.should.equal('MyScalar(ip: "192.168.0.1")');
    });

    it('should use multiple examples from description for non-nullable args for SCALAR fields', () => {
        const arg = {
            defaultValue: null,
            description: "Comprehensive description.",
            name: "ip",
            type: {kind: "NON_NULL", name: null, ofType: {kind: "SCALAR", name: "String", ofType: null}}
        };
        const result = buildQueryTreeFromField({
            type: {
                name: 'ScalarField'
            },
            name: 'MyScalar',
            args: [arg],
            description: 'Example: \nMyScalar(ip: "192.168.0.1")\nMyScalar(ip: "192.168.0.2")'
        },
            typeDictionary
        );
        result.should.equal('MyScalar(ip: "192.168.0.1") MyScalar(ip: "192.168.0.2")');
    });
});
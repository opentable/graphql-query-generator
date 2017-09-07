module.exports = {
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
    },
    DeeplyNestedObject2: {
        name: 'DeeplyNestedObject2',
        kind: 'OBJECT',
        fields: [
            { name: 'DeepNest', type: { name: 'DeeplyNestedObject' }, args: [] }
        ]
    },
    ObjectContainingTwoDeeplyNestedObjects: {
        name: 'ObjectContainingTwoDeeplyNestedObjects',
        kind: 'OBJECT',
        fields: [
            { name: 'DeepNest', type: { name: 'DeeplyNestedObject' }, args: [] },
            { name: 'DeepNest2', type: { name: 'DeeplyNestedObject2' }, args: [] }
        ]
    },
    DeeplyNestedObjectWithPartialNoFollow: {
        name: 'DeeplyNestedObjectWithPartialNoFollow',
        kind: 'OBJECT',
        fields: [
            { name: 'NotSoDeepNest', type: { name: 'ObjectField' }, args: [] },
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
            }
        ]
    }
};
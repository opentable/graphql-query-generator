import { getQueryFields, getQueryFieldsModes } from '../../../src/schemaToQueryTree';
import mockData from '../mockData';

describe('Build coverage', () => {
  let typeDictionary;

  beforeEach(() => {
    typeDictionary = mockData;
  });

  it('should be able to fetch all fields', () => {
    const result = getQueryFields(
      getQueryFieldsModes.ALL_FIELDS,
      {
        type: {
          name: 'DeeplyNestedObjectWithPartialNoFollow',
        },
        name: 'Test',
        args: [],
      },
      typeDictionary,
      []
    );
    expect(result.length).toBe(9);
    expect(result.filter((r) => r.indexOf('NOFollowPart') > 0).length).toBe(1);
  });

  it('should be able to fetch only queryable fields', () => {
    const result = getQueryFields(
      getQueryFieldsModes.QUERYABLE_FIELDS,
      {
        type: {
          name: 'DeeplyNestedObjectWithPartialNoFollow',
        },
        name: 'Test',
        args: [],
      },
      typeDictionary,
      []
    );
    expect(result.length).toBe(4);
    expect(result.filter((r) => r.indexOf('NOFollowPart') > 0).length).toBe(0);
  });

  it('should not return querable fields if root object is not querable', () => {
    const result = getQueryFields(
      getQueryFieldsModes.QUERYABLE_FIELDS,
      {
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
      },
      typeDictionary,
      []
    );
    expect(result.length).toBe(0);
  });
});

import {
  isNotNullable,
  getFields,
  getFieldNameOrExamplesIfNecessary,
  magiclyExtractFieldTypeName,
  getSkipKey,
} from './schemaToQueryTree';

describe('Schema to query tree', () => {
  it('isNonNullable Non null', () => {
    expect(isNotNullable({ type: { kind: 'NON_NULL' } })).toEqual(true);
  });
  it('isNonNullable List of non null', () => {
    expect(
      isNotNullable({
        type: {
          kind: 'LIST',
          ofType: { kind: 'NON_NULL' },
        },
      })
    ).toEqual(true);
  });
  it('isNonNullable Object', () => {
    expect(isNotNullable({ type: { kind: 'OBJECT' } })).toEqual(false);
  });
  it('getFields', () => {
    expect(
      getFields(
        {
          type: { name: 'SomeTypeName' },
        },
        {
          SomeTypeName: {
            fields: [{ name: 'f1' }, { name: 'f2' }],
          },
        }
      )
    ).toEqual([{ name: 'f1' }, { name: 'f2' }]);
  });
  it('getFieldNameOrExamplesIfNecessary name', () => {
    expect(getFieldNameOrExamplesIfNecessary({ name: 'Name', args: [] })).toEqual(['Name']);
  });
  it('getFieldNameOrExamplesIfNecessary name and description', () => {
    expect(
      getFieldNameOrExamplesIfNecessary({
        name: 'People',
        args: [{ type: { kind: 'NON_NULL' } }],
        description: 'Examples: People(test: 1)',
      })
    ).toEqual(['People(test: 1)']);
  });
  it('getFieldNameOrExamplesIfNecessary name and args', () => {
    expect(
      getFieldNameOrExamplesIfNecessary({
        name: 'People',
        args: [{ type: { kind: 'NULL' } }],
      })
    ).toEqual(['People']);
  });
  it('magiclyExtractFieldTypeName Person', () => {
    expect(magiclyExtractFieldTypeName({ type: { name: 'Person' } })).toEqual('Person');
  });
  it('magiclyExtractFieldTypeName TestType', () => {
    expect(
      magiclyExtractFieldTypeName({
        type: {
          name: 'NotMe',
          ofType: {
            name: 'MeNeither',
            ofType: { name: 'TestType' },
          },
        },
      })
    ).toEqual('TestType');
  });
  it('getSkipKey ParentTypeName', () => {
    expect(getSkipKey({ name: 'TypeName' }, { name: 'FieldName' }, { name: 'ParentTypeName' })).toEqual(
      'FieldName-TypeName-ParentTypeName'
    );
  });
  it('getSkipKey FieldName-TypeName-ROOT', () => {
    expect(getSkipKey({ name: 'TypeName' }, { name: 'FieldName' }, null)).toEqual('FieldName-TypeName-ROOT');
  });
});

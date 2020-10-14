import queryTreeToGraphQLString from './aqtToQuery';

describe('Query tree to graphql string', () => {
  it('single prop', () => {
    expect(queryTreeToGraphQLString('name')).toEqual('name');
  });
  it('multiple of different name prop', () => {
    expect(queryTreeToGraphQLString(['name', 'surname', 'age'])).toEqual('name surname age ');
  });
  it('multiple of same name prop', () => {
    //TODO: Should fix to output name name1:name name2:name
    expect(queryTreeToGraphQLString(['name', 'name', 'name'])).toEqual('name name name ');
  });
  it('convert nested string or array to object', () => {
    expect(queryTreeToGraphQLString({ people: 'name', countries: ['flag'] })).toEqual(
      'people { name }countries { flag  }'
    );
  });
  it('handle array', () => {
    expect(queryTreeToGraphQLString(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a'] }])).toEqual(
      'id name coordinates { lat long  } test { a  } '
    );
  });
});

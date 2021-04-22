import GraphQLQuery from './queryClass';

describe('Query class name', () => {
  it('name single arg', () => {
    const query = new GraphQLQuery('{ playlist(id: "123") { id  name } }', 'query');
    expect(query.name).toEqual('playlist');
  });
  it('name two args', () => {
    const query = new GraphQLQuery('playlist (id: "123", name: "test")', 'query');
    expect(query.name).toEqual('playlist');
  });
  it('single directive', () => {
    const query = new GraphQLQuery('playlist(id: "123") @last', 'query');
    expect(query.name).toEqual('playlist');
  });
  it('alias single directive', () => {
    const query = new GraphQLQuery('pl1: playlist(id: "123") @last', 'query');
    expect(query.name).toEqual('playlist');
  });
  it('alias two directives', () => {
    const query = new GraphQLQuery(
      ' pl1: playlist (id: "123", name: "test") @sla(maxResponseTime: "1s") @last',
      'query'
    );
    expect(query.name).toEqual('playlist');
  });
  it('summer playlist', () => {
    const query = new GraphQLQuery(
      '{ summerPlaylist:createPlaylist(name: "Summer Mix") @sla(maxResponseTime: ".5s") { id  name  tracks { id  title  artist  album   }  } }',
      'mutation'
    );
    expect(query.name).toEqual('createPlaylist');
  });
  it('fall playlist', () => {
    const query = new GraphQLQuery(
      '{ fallPlaylist:createPlaylist(name: "Fall Mix") { id  name  tracks { id  title  artist  album   }  } }',
      'mutation'
    );
    expect(query.name).toEqual('createPlaylist');
  });
});

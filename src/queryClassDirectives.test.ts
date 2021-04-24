import GraphQLQuery from './queryClass';

describe('Query class directives', () => {
  it('No directive', () => {
    const query = new GraphQLQuery('{ playlist(id: "123") { id name } }', 'query');
    expect(query.name).toEqual('playlist');
    expect(query.directives).toEqual(undefined);
    expect(query.query).toEqual('{ playlist(id: "123") { id name } }');
    expect(query.isLast).toEqual(false);
    expect(query.sla).toEqual(null);
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('One directive', () => {
    const query = new GraphQLQuery(
      '{ pl1:playlist(id: "{{summerPlaylist.id}}") @sla(maxResponseTime: "1ms") { id  name  tracks { id  title  artist  album   }  } }',
      'query'
    );
    expect(query.name).toEqual('playlist');
    expect(query.directives).toEqual('@sla(maxResponseTime: "1ms")');
    expect(query.query).toEqual(
      '{ pl1:playlist(id: "{{summerPlaylist.id}}") { id  name  tracks { id  title  artist  album   }  } }'
    );
    expect(query.isLast).toEqual(false);
    expect(query.sla).toEqual({ responseTime: 1 });
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('pl1');
    expect(query.ensureMinimum).toEqual(null);
  });

  it('Summer playlist directives', () => {
    const query = new GraphQLQuery(
      '{ summerPlaylist: createPlaylist(name: "Summer Mix") @sla(maxResponseTime: ".5s") { id  name  tracks { id  title  artist  album   }  } }',
      'query'
    );
    expect(query.name).toEqual('createPlaylist');
    expect(query.directives).toEqual('@sla(maxResponseTime: ".5s")');
    expect(query.query).toEqual(
      '{ summerPlaylist: createPlaylist(name: "Summer Mix") { id  name  tracks { id  title  artist  album   }  } }'
    );
    expect(query.isLast).toEqual(false);
    expect(query.sla).toEqual({ responseTime: 500 });
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('summerPlaylist');
    expect(query.ensureMinimum).toEqual(null);
  });

  it('Two directives', () => {
    const query = new GraphQLQuery(
      '{ pl1: playlist(id: "123", name: "test") @sla(maxResponseTime: "1s") @last { id name } }',
      'query'
    );
    expect(query.name).toEqual('playlist');
    expect(query.directives).toEqual('@sla(maxResponseTime: "1s") @last');
    expect(query.query).toEqual('{ pl1: playlist(id: "123", name: "test") { id name } }');
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual({ responseTime: 1000 });
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('pl1');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('Three directives', () => {
    const query = new GraphQLQuery(
      '{ playlist(name: "test") @wait(waitTime: "3s") @sla(maxResponseTime: "2s") @last { id name } }',
      'query'
    );
    expect(query.name).toEqual('playlist');
    expect(query.directives).toEqual('@wait(waitTime: "3s") @sla(maxResponseTime: "2s") @last');
    expect(query.query).toEqual('{ playlist(name: "test") { id name } }');
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual({ responseTime: 2000 });
    expect(query.wait).toEqual({ waitTime: 3000 });
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('Four directives', () => {
    const query = new GraphQLQuery(
      '{ playlist(name: "test") @sla(maxResponseTime: "2s") @wait(waitTime: "3s") @ensureMinimum(nItems: 2, inArrays:["playlist.tracks"]) @last { id name } }',
      'query'
    );
    expect(query.directives).toEqual(
      '@sla(maxResponseTime: "2s") @wait(waitTime: "3s") @ensureMinimum(nItems: 2, inArrays:["playlist.tracks"]) @last'
    );
    expect(query.name).toEqual('playlist');
    expect(query.query).toEqual('{ playlist(name: "test") { id name } }');
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual({ responseTime: 2000 });
    expect(query.wait).toEqual({ waitTime: 3000 });
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual({ arrays: ['playlist.tracks'], items: 2 });
  });

  ('{ pl1:playlist(id: "{{summerPlaylist.id}}") @sla(maxResponseTime: "1ms") { id  name  tracks { id  title  artist  album   }  } }');
});

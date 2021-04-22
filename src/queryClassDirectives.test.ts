import GraphQLQuery from './queryClass';

describe('Query class directives', () => {
  it('No directive', () => {
    const query = new GraphQLQuery('playlist(id: "123")', 'query');
    expect(query.isLast).toEqual(false);
    expect(query.sla).toEqual(null);
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('One directive', () => {
    const query = new GraphQLQuery('playlist(id: "123") @last', 'query');
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual(null);
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('Two directives', () => {
    const query = new GraphQLQuery('pl1: playlist(id: "123", name: "test") @sla(maxResponseTime: "1s") @last', 'query');
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual({ responseTime: 1000 });
    expect(query.wait).toEqual(null);
    expect(query.alias).toEqual('pl1');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('Three directives', () => {
    const query = new GraphQLQuery(
      'playlist(name: "test") @wait(waitTime: "3s") @sla(maxResponseTime: "2s") @last',
      'query'
    );
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual({ responseTime: 2000 });
    expect(query.wait).toEqual({ waitTime: 3000 });
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual(null);
  });
  it('Four directives', () => {
    const query = new GraphQLQuery(
      'playlist(name: "test")  @sla(maxResponseTime: "2s") @wait(waitTime: "3s") @ensureMinimum(nItems: 2, inArrays:["playlist.tracks"]) @last',
      'query'
    );
    expect(query.isLast).toEqual(true);
    expect(query.sla).toEqual({ responseTime: 2000 });
    expect(query.wait).toEqual({ waitTime: 3000 });
    expect(query.alias).toEqual('');
    expect(query.ensureMinimum).toEqual({ arrays: ['playlist.tracks'], items: 2 });
  });
});

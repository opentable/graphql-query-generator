import * as fs from 'fs';
import { mockServer } from 'graphql-tools';

export function mockPlaylistServer() {
  // Load graphql schema file from src folder as TS doesn't copy it to lib
  const typeDefs = [fs.readFileSync(__dirname + '/../../src/test/playlist.graphql', 'utf8')];

  // Can add mock resolvers but they are optional.
  // If not provided, mockServer will return it's own mock data.
  const mocks = {
    // Tag: () => ({
    //   tag: 'Hello',
    // }),
    // ID: () => 'A',
    // Playlist: {
    //   tracks: () => [{}, {}, {}],
    // },
  };

  return mockServer(typeDefs, mocks, false);
}

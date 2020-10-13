import * as fs from 'fs';
import { mockServer } from 'graphql-tools';

export function mockPlaylistServer() {
  const typeDefs = [fs.readFileSync(__dirname + '/../../src/test/playlist.graphql', 'utf8')];

  const mocks = {
    // Tag: () => ({
    //   tag: 'Hello',
    // }),
    // ID: () => 'A',
  };

  return mockServer(typeDefs, mocks, false);
}

import * as fs from 'fs';
import { MockList, mockServer } from 'graphql-tools';

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
    RootQuery: () => ({
      searchPlaylists: () => new MockList([2, 4]),
      // searchPlaylists: () => [
      //   {
      //     name: 'playlist',
      //     tracks: [
      //       [
      //         {
      //           title: 'test',
      //         },
      //         {
      //           title: 'test',
      //         },
      //         {
      //           title: 'test',
      //         },
      //       ],
      //     ],
      //   },
      // ],
    }),
    // Playlist: () => ({
    //   tracks: () => new MockList([2, 3]),
    // }),
    // Playlist: () => ({
    //   tracks: () => [
    //     {
    //       title: 'test',
    //     },
    //     {
    //       title: 'test',
    //     },
    //     {
    //       title: 'test',
    //     },
    //   ],
    // }),
    // Track: () => ({
    //   title: () => 'test',
    // }),
  };

  return mockServer(typeDefs, mocks, true);
}

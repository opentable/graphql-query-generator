"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mockPlaylistServer = void 0;
const fs = __importStar(require("fs"));
const graphql_tools_1 = require("graphql-tools");
function mockPlaylistServer() {
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
            searchPlaylists: () => new graphql_tools_1.MockList([2, 4]),
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
    return graphql_tools_1.mockServer(typeDefs, mocks, true);
}
exports.mockPlaylistServer = mockPlaylistServer;
//# sourceMappingURL=mockServer.js.map
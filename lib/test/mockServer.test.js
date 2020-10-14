"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const mockServer_1 = require("./mockServer");
const testRunner_1 = require("../cli/testRunner");
let reports;
let queries;
let mutations;
beforeAll((done) => __awaiter(void 0, void 0, void 0, function* () {
    const server = mockServer_1.mockPlaylistServer();
    reports = yield testRunner_1.runGraphQLTests(server);
    queries = reports.filter(({ query }) => query.type === 'QUERY').map((q) => q.query);
    mutations = reports.filter(({ query }) => query.type === 'MUTATION').map((q) => q.query);
    done();
}));
describe('Test Runner', () => {
    it('Report should not have errors', () => {
        expect(reports[0].errors.length).toBe(0);
    });
});
describe('Query generation', () => {
    it('Generates multiple queries', () => {
        expect(queries.map((q) => q.name).filter((q) => q.match(/playlist/g)).length).toEqual(2);
    });
    it('Generates multiple mutations', () => {
        expect(mutations.map((q) => q.name).filter((q) => q.match(/createPlaylist/g)).length).toEqual(2);
    });
    it('Ignores fields with +NOFOLLOW in description', () => {
        expect(queries.map((q) => q.name).filter((q) => q.match(/ignoredQuery/g)).length).toEqual(0);
    });
    // TODO: Add coverage back
    // it('Calculates valid coverage', () => {
    //   expect(reports.coverage.coverageRatio).toBeGreaterThanOrEqual(0);
    //   expect(reports.coverage.coverageRatio).toBeLessThanOrEqual(1);
    //   if (reports.coverage.coverageRatio < 1.0) {
    //     expect(reports.coverage.notCoveredFields.length).toBeGreaterThanOrEqual(1);
    //   } else {
    //     expect(reports.coverage.notCoveredFields.length).toEqual(0);
    //   }
    // });
});
//# sourceMappingURL=mockServer.test.js.map
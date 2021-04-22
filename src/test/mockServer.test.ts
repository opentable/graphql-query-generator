import { mockPlaylistServer } from './mockServer';
import { runGraphQLTests } from '../cli/testRunner';

let reports;
let queries;
let mutations;

beforeAll(async (done) => {
  const server = mockPlaylistServer();
  reports = await runGraphQLTests(server);
  queries = reports.filter(({ query }) => query.type === 'QUERY').map((q) => q.query);
  mutations = reports.filter(({ query }) => query.type === 'MUTATION').map((q) => q.query);
  done();
});

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

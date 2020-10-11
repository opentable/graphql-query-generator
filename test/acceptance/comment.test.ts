import service from './exampleServer';
import QueryGenerator from '../../src/queryGenerator';

const serverUrl = 'http://localhost:12345/graphql';
let report: any;
let queries: any[];
let mutations: any[];
let coverage: any;

beforeAll(async (done) => {
  // Start service
  await service;
  const queryGenerator = new QueryGenerator(serverUrl);
  report = await queryGenerator.run();
  queries = report.queries.filter((query) => query.type === 'QUERY').map((q) => q.query);
  mutations = report.queries.filter((query) => query.type === 'MUTATION').map((q) => q.query);
  coverage = report.coverage;
  done();
});

describe('Query generation', () => {
  it('Generates multiple queries', () => {
    expect(queries).toEqual(expect.arrayContaining([expect.stringMatching(/rollDice/)]));
  });

  it('Generates multiple mutations', () => {
    expect(mutations).toEqual(expect.arrayContaining([expect.stringMatching(/createGame/)]));
  });

  it('Ignores fields with +NOFOLLOW in description', () => {
    expect(queries.filter((q) => q.match(/ignoredWithExamples/g)).length).toEqual(0);
    expect(queries.filter((q) => q.match(/ignoredNoParameters/g)).length).toEqual(0);
  });

  it('Uses Examples section for scalar fields with non-nullable args', () => {
    expect(queries.filter((q) => q.match(/rollXTimes\(times. [0-9]+\)/g)).length).toEqual(4);
  });

  it('Calculates valid coverage', () => {
    expect(coverage.coverageRatio).toBeGreaterThanOrEqual(0);
    expect(coverage.coverageRatio).toBeLessThanOrEqual(1);
    if (coverage.coverageRatio < 1.0) {
      expect(coverage.notCoveredFields.length).toBeGreaterThanOrEqual(1);
    } else {
      expect(coverage.notCoveredFields.length).toEqual(0);
    }
  });
});

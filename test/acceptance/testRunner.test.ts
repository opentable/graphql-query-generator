import service from './exampleServer';
import { runGraphQLTests } from '../../src/cli/testRunner';

const serverUrl = 'http://localhost:12345/graphql';
let report: any;

beforeAll(async (done) => {
  // Start service
  // await service;
  report = await runGraphQLTests(serverUrl);
  done();
});

describe('Test Runner', () => {
  it('Report should not have errors', () => {
    expect(report[0].errors.length).toBe(0);
  });
});

import 'mocha';
import app from './exampleServer';
import { runGraphQLTests } from '../../src/cli/testRunner';

describe('Test Runner', () => {
  const serverUrl = 'http://localhost:12345/graphql';
  let queryPromise: Promise<any>;

  before(() =>
    app.then(() => {
      queryPromise = runGraphQLTests(serverUrl);
    })
  );

  it('Report should not have errors', () => {
    return queryPromise.then((reportData) => {
      // console.log(reportData);
      reportData[0].errors.length.should.equal(0);
    });
  });
});

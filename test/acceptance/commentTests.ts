const should = require('chai').should();
const app = require('./exampleServer');
import QueryGenerator from '../../src/queryGenerator');

describe('Query generation', () => {
  const serverUrl = 'http://localhost:12345/graphql';
  let queryPromise = null;

  before(() =>
    app.then(() => {
      const queryGenerator = new QueryGenerator(serverUrl);
      queryPromise = queryGenerator.run();
    })
  );

  it('Generates multiple queries', () => {
    return queryPromise.then(({ queries }) => {
      (queries.filter((query) => query.type === 'QUERY')[0].query.match(/rollDice/g) || []).length.should.equal(4);
    });
  });

  it('Ignores fields with +NOFOLLOW in description', () => {
    return queryPromise.then(({ queries }) => {
      (
        queries.filter((query) => query.type === 'QUERY')[0].query.match(/ignoredWithExamples/g) || []
      ).length.should.equal(0);
      (
        queries.filter((query) => query.type === 'QUERY')[0].query.match(/ignoredNoParameters/g) || []
      ).length.should.equal(0);
    });
  });

  it('Generates multiple mutations', () => {
    return queryPromise.then(({ queries }) => {
      (queries.filter((query) => query.type === 'MUTATION')[0].query.match(/createGame/g) || []).length.should.equal(2);
    });
  });

  it('Uses Examples section for scalar fields with non-nullable args', () => {
    return queryPromise.then(({ queries }) => {
      // 8 because we have two examples for rollXTimes and 4 examples of parent
      (
        queries.filter((query) => query.type === 'QUERY')[0].query.match(/rollXTimes\(times. [0-9]+\)/g) || []
      ).length.should.equal(8);
    });
  });

  it('Calculates valid coverage', () => {
    return queryPromise.then(({ coverage }) => {
      coverage.coverageRatio.should.be.at.least(0);
      coverage.coverageRatio.should.be.at.most(1);
      if (coverage.coverageRatio < 1.0) {
        coverage.notCoveredFields.length.should.be.at.least(1);
      } else {
        coverage.notCoveredFields.length.should.equal(0);
      }
    });
  });
});

const should = require('chai').should();
const app = require('./exampleServer');
const QueryGenerator = require('../../lib/queryGenerator');

describe('Query generation', () => {

  const serverUrl = 'http://localhost:12345/graphql';
  let queryPromise = null;

  before(() => app.then(()=>{
    const queryGenerator = new QueryGenerator(serverUrl);
    queryPromise = queryGenerator.run();
  }));

  it('Generates multiple queries', () => {
    return queryPromise
        .then(({queries}) => {
          (queries[0].match(/rollDice/g) || []).length.should.equal(4);
        });

  });

  it('Ignores fields with +NOFOLLOW in description', () => {
    return queryPromise
      .then(({queries}) => {
        (queries[0].match(/ignoredWithExamples/g) || []).length.should.equal(0);
        (queries[0].match(/ignoredNoParameters/g) || []).length.should.equal(0);
      });
  });

  it('Generates multiple mutations', () => {
    return queryPromise
        .then(({mutations}) => {
          (mutations[0].match(/createGame/g) || []).length.should.equal(2);
        });
  });

  it('Uses Examples section for scalar fields with non-nullable args', () => {
    return queryPromise
      .then(({queries}) => {
        // 8 because we have two examples for rollXTimes and 4 examples of parent
        (queries[0].match(/rollXTimes\(times. [0-9]+\)/g) || []).length.should.equal(8);
      });
  });

  it('Calculates valid coverage', () => {
    return queryPromise
      .then(({queryCoverage, mutationCoverage}) => {
        queryCoverage.coverageRatio.should.be.at.least(0);
        queryCoverage.coverageRatio.should.be.at.most(1);
        if(queryCoverage.coverageRatio < 1.0) {
          queryCoverage.notCoveredFields.length.should.be.at.least(1);
        } else {
          queryCoverage.notCoveredFields.length.should.equal(0);
        }
        mutationCoverage.coverageRatio.should.be.at.least(0);
        mutationCoverage.coverageRatio.should.be.at.most(1);
        if(mutationCoverage.coverageRatio < 1.0) {
          mutationCoverage.notCoveredFields.length.should.be.at.least(1);
        } else {
          mutationCoverage.notCoveredFields.length.should.equal(0);
        }
      });
  });

});
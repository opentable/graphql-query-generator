const should = require('chai').should();
const app = require('./exampleServer');
const QueryGenerator = require('../../lib/queryGenerator');

describe('Query generation', () => {

  const serverUrl = 'http://localhost:12345/graphql';
  let queries = null;

  before(() => app.then(()=>{
    const queryGenerator = new QueryGenerator(serverUrl);
    queries = queryGenerator.run();
  }));

  it('Generates multiple quieries', () => {
    return queries
        .then(x => {
          (x[0].match(/rollDice/g) || []).length.should.equal(4);
        });
      
  });

  it('Ignores fields with +NOFOLLOW in description', () => {
    return queries
      .then(x => {
        (x[0].match(/ignoredWithExamples/g) || []).length.should.equal(0);
        (x[0].match(/ignoredNoParameters/g) || []).length.should.equal(0);
      });

  });

});
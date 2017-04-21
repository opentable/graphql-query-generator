const should = require('chai').should();
const app = require('./exampleServer');
const QueryGenerator = require('../../queryGenerator');

describe('Query generation', () => {

  const serverUrl = 'http://localhost:12345/graphql';

  before(() => app);

  it('Generates multiple quieries', () => {
    
    const queryGenerator = new QueryGenerator(serverUrl);
    
    return queryGenerator.run()
        .then(x => {
          (x[0].match(/rollDice/g) || []).length.should.equal(4);
        });
      
  });

});
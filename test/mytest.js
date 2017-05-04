const QueryGenerator = require('../lib/queryGenerator');
const assert = require('chai').assert;

describe.skip('this is a base test', () => {
  const queryGenerator = new QueryGenerator('http://localhost:56097/');

  it('should pass', () => {
    return queryGenerator.run().then(x => {
      console.dir(x);
    });
  });
});
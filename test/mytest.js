const QueryGenerator = require('../queryGenerator');
const assert = require('chai').assert;;

describe('this is a base test', () => {
  const topMostStuff = 'root';
  const queryGenerator = new QueryGenerator(topMostStuff, 'http://localhost:56097/');

  it('should pass', () => {
    return queryGenerator.run().then(x => {
      console.dir(x);
    });
  });
});
const app = require('./exampleServer');
const queryGenerator = require('../../queryGenerator');

describe('test', () => {

  before(() => app);

  it('1', () => {
    
    var thing = new queryGenerator('http://localhost:12345/graphql')
    
    return thing.run()
        .then(x => {
            console.log('robert test');
            console.dir(x)
        });
      
  });

});
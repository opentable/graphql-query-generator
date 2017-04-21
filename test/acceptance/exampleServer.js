var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`

  type IgnoredSubtype {
    aValue: Int
  }
  
  type RandomnessStatistics {
    explanation: String!
  }
  
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    statistics(page: Int!): RandomnessStatistics!
    
    # A description for ignored field with parameters
    #
    # Examples:
    # ignoredWithExamples(parameter: 42)
    # +NOFOLLOW
    ignoredWithExamples(parameter: Int!): IgnoredSubtype

    ignoredNoParameters: IgnoredSubtype
  }

  type Query {
    # RollDice has four examples
    #
    # Examples:
    # rollDice(numDice: 4, numSides: 2)
    # rollDice( numDice : 40 , numSides:2)
    # rollDice ( numDice: 123 , numSides: 299 )
    # rollDice (
    #   numDice:4,
    #   numSides: 2342
    # )
    rollDice(numDice: Int!, numSides: Int): RandomDie
  }
`);

class IgnoredSubtype {
  constructor() {
    this.aValue = 42;
  }
}

class RandomnessStatistics {
  constructor() {
    this.explanation = "Because we can";
  }
}

class RandomDie {
  constructor() {
    this.numSides = 4;  // chosen by fair dice roll
    this.rollOnce = 1;  // guaranteed to be random
    this.statistics = () => new RandomnessStatistics();
    this.ignoredWithExamples = () => new IgnoredSubtype();
    this.ignoredNoParameters = () => new IgnoredSubtype();
  }
}

var app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: { rollDice: () => { return new RandomDie(); } },
  graphiql: true,
}));



module.exports = new Promise((resolve, reject) => {
  app.listen(12345, resolve);
});

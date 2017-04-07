var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');

var schema = buildSchema(`
  
  type RandomnessStatistics {
    explanation: String!
  }
  
  type RandomDie {
    numSides: Int!
    rollOnce: Int!
    statistics(page: Int!): RandomnessStatistics!
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

class RandomnessStatistics {
  constructor() {
    this.explanation = "Because we can";
  }
}

class RandomDie {
  constructor() {
    this.numSides = 4;  // chosen by fair dice roll
    this.rollOnce = 1;  // guaranteed to be random
    this.statistics = () => new RandomnessStatistics()
  }
}

var app = express();

app.use('/graphql', graphqlHTTP({
  schema: schema,
  rootValue: { rollDice: () => { return new RandomDie(); } },
  graphiql: true,
}));

app.listen(12345);

module.exports = app;

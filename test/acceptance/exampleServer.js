var express = require('express');
var graphqlHTTP = require('express-graphql');
var { buildSchema } = require('graphql');
const short = require('short-uuid');

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

    # Scalar field with non nullable arg and example section
    # Examples:
    # firstRoll: rollXTimes(times: 10)
    # secondRoll: rollXTimes(times: 11)
    rollXTimes(times: Int!): Int!

    # A description for ignored field with parameters
    #
    # Examples:
    # ignoredWithExamples(parameter: 42)
    # +NOFOLLOW
    ignoredWithExamples(parameter: Int!): IgnoredSubtype

    # +NOFOLLOW
    ignoredNoParameters: IgnoredSubtype
  }

  type Query {
    # RollDice has four examples
    #
    # Examples:
    # roll1: rollDice(numDice: 4, numSides: 2)
    # roll2: rollDice( numDice : 40 , numSides:2)
    # roll3: rollDice ( numDice: 2, numSides: 299 )
    # roll4: rollDice (
    #   numDice:4,
    #   numSides: 2342
    # )
    rollDice(numDice: Int!, numSides: Int): RandomDie
  }

  type Mutation {
    # Examples:
    # fourPlayerGame:createGame(players: 4)
    # twoPlayerGame:createGame(players: 2)
    createGame(players: Int!): Game

    # Examples:
    # startGame(id: "{{twoPlayerGame.id}}")
    startGame(id: ID!) : Game

    # Examples:
    # endGame(id: "{{twoPlayerGame.id}}")
    endGame(id: ID!): Game
  }

  type Game {
    id: ID!
    state: GameState!
    players: Int!
  }

  enum GameState {
    PENDING
    IN_PROGRESS
    COMPLETED
  }
`);

class IgnoredSubtype {
  constructor() {
    this.aValue = 42;
  }
}

class RandomnessStatistics {
  constructor() {
    this.explanation = 'Because we can';
  }
}

class RandomDie {
  constructor() {
    this.numSides = 4; // chosen by fair dice roll
    this.rollOnce = 1; // guaranteed to be random
    this.rollXTimes = () => 12;
    this.statistics = () => new RandomnessStatistics();
    this.ignoredWithExamples = () => new IgnoredSubtype();
    this.ignoredNoParameters = () => new IgnoredSubtype();
  }
}

class Game {
  constructor(players) {
    this.id = short.generate();
    this.players = players;
    this.state = 'PENDING';
  }
}

var app = express();

let game;

app.use(
  '/graphql',
  graphqlHTTP({
    schema: schema,
    rootValue: {
      rollDice: () => {
        return new RandomDie();
      },
    },
    mutations: {
      createGame: (players) => {
        return (game = new Game(players));
      },
      startGame: () => {
        return (game.state = 'IN_PROGRESS');
      },
      endGame: () => {
        return (game.state = 'COMPLETED');
      },
    },
    graphiql: true,
  })
);

module.exports = new Promise((resolve, reject) => {
  app.listen(12345, resolve);
});

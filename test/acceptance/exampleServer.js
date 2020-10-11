var express_1 = require('express');
var express_graphql_1 = require('express-graphql');
var graphql_1 = require('graphql');
var short_uuid_1 = require('short-uuid');
var schema = graphql_1.buildSchema("\n\n  type IgnoredSubtype {\n    aValue: Int\n  }\n\n  type RandomnessStatistics {\n    explanation: String!\n  }\n\n  type RandomDie {\n    numSides: Int!\n    rollOnce: Int!\n    statistics(page: Int!): RandomnessStatistics!\n\n    # Scalar field with non nullable arg and example section\n    # Examples:\n    # firstRoll: rollXTimes(times: 10)\n    # secondRoll: rollXTimes(times: 11)\n    rollXTimes(times: Int!): Int!\n\n    # A description for ignored field with parameters\n    #\n    # Examples:\n    # ignoredWithExamples(parameter: 42)\n    # +NOFOLLOW\n    ignoredWithExamples(parameter: Int!): IgnoredSubtype\n\n    # +NOFOLLOW\n    ignoredNoParameters: IgnoredSubtype\n  }\n\n  type Query {\n    # RollDice has four examples\n    #\n    # Examples:\n    # roll1: rollDice(numDice: 4, numSides: 2)\n    # roll2: rollDice( numDice : 40 , numSides:2)\n    # roll3: rollDice ( numDice: 2, numSides: 299 )\n    # roll4: rollDice (\n    #   numDice:4,\n    #   numSides: 2342\n    # )\n    rollDice(numDice: Int!, numSides: Int): RandomDie\n  }\n\n  type Mutation {\n    # Examples:\n    # fourPlayerGame:createGame(players: 4)\n    # twoPlayerGame:createGame(players: 2)\n    createGame(players: Int!): Game\n\n    # Examples:\n    # startGame(id: \"{{twoPlayerGame.id}}\")\n    startGame(id: ID!) : Game\n\n    # Examples:\n    # endGame(id: \"{{twoPlayerGame.id}}\")\n    endGame(id: ID!): Game\n  }\n\n  type Game {\n    id: ID!\n    state: GameState!\n    players: Int!\n  }\n\n  enum GameState {\n    PENDING\n    IN_PROGRESS\n    COMPLETED\n  }\n");
var IgnoredSubtype = (function () {
    function IgnoredSubtype() {
        this.aValue = 42;
    }
    return IgnoredSubtype;
})();
var RandomnessStatistics = (function () {
    function RandomnessStatistics() {
        this.explanation = 'Because we can';
    }
    return RandomnessStatistics;
})();
var RandomDie = (function () {
    function RandomDie() {
        this.numSides = 4; // chosen by fair dice roll
        this.rollOnce = 1; // guaranteed to be random
        this.rollXTimes = function () { return 12; };
        this.statistics = function () { return new RandomnessStatistics(); };
        this.ignoredWithExamples = function () { return new IgnoredSubtype(); };
        this.ignoredNoParameters = function () { return new IgnoredSubtype(); };
    }
    return RandomDie;
})();
var Game = (function () {
    function Game(players) {
        this.id = short_uuid_1.generate();
        this.players = players;
        this.state = 'PENDING';
    }
    return Game;
})();
var app = express_1["default"]();
var game;
app.use('/graphql', express_graphql_1["default"]({
    schema: schema,
    rootValue: {
        rollDice: function () {
            return new RandomDie();
        }
    },
    mutations: {
        createGame: function (players) {
            return (game = new Game(players));
        },
        startGame: function () {
            return (game.state = 'IN_PROGRESS');
        },
        endGame: function () {
            return (game.state = 'COMPLETED');
        }
    },
    graphiql: true
}));
exports["default"] = new Promise(function (resolve, reject) {
    app.listen(12345, resolve);
});

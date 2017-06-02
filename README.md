![badge](https://graphql-query-generator.visualstudio.com/_apis/public/build/definitions/091bfe98-4175-4ef4-b7d5-8bbfa6f62a13/1/badge)

# GraphQL Query Generator
GraphQL Query Generator is a library/tool that helps you easily test your GraphQL endpoints using introspection!

## Quick Start
Execute following commands to get this tool running.
> NOTE: Whenever there are parameters required you need to provide them in Graphql schema by following our Examples notation. You can find it in [Usage](#Usage) section.

```
npm i -g graphql-query-generator
gql-test http://<your-server-address>:<your-server-port>
gql-test --help # for more information
```

## Usage
First, annotate your queries:

```
type Query {
  # RollDice has four examples
  #
  # Examples:
  # rollDice(numDice: 4, numSides: 2)
  # rollDice( numDice : 40 , numSides:2)
  # rollDice ( numDice: 2, numSides: 299 )
  # rollDice (
  #   numDice:4,
  #   numSides: 2342
  # )
  rollDice(numDice: Int!, numSides: Int): RandomDie
}
```

adding `+NOFOLLOW` in examples will prevent this path from being followed when creating queries

```
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

  # +NOFOLLOW
  ignoredNoParameters: Ig noredSubtype
}
```

Afterwards, either:

1. Use the CLI tool as noted in the quick-start
2. Install the library and generate your own tests

## Contributing
Please submit PR's and create issues... lol... don't break shit. We have little tests so yeah and code is a mess, but deal with it. It works on my machine.
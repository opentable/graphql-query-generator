[![build](https://api.travis-ci.org/opentable/graphql-query-generator.svg?branch=master)](https://travis-ci.org/opentable/graphql-query-generator)

# GraphQL Query Generator
GraphQL Query Generator is a library/tool that helps you easily test your GraphQL endpoints using introspection!

## Getting Started
So you want to test your GraphQL endpoint.  This tool will generate all the queries that your GraphQL endpoint will have.  However, for queries that require parameters, this tool will need annotations.  So please follow the steps below to get started.

### 1. Annotate your queries (optional, although highly recommended):
Create example queries that you want tested in the comments!
```graphql
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

### 2 Run the tool!

You can use either the CLI or the library to get started!

#### 2.1 Using the CLI

Execute following commands to get this tool running.
> NOTE: Whenever there are parameters required you need to provide them in Graphql schema by following our Examples notation. You can find it in [Usage](#Usage) section.

```
npm i -g graphql-query-generator
gql-test http://<your-server-address>:<your-server-port>
gql-test --help # for more information
```

#### 2.2 Using the library
If you want more control over the queries that are generated via this tool.  Please see the following example:

```javascript
const QueryGenerator = require('graphql-query-generator');
const request = require('request');
const assert = require('assert');

describe('Query generation', function() {
  const serverUrl = 'http://<your-server-address>:<your-server-port>/graphql';
  let queries = null;

  before(() => {
    const queryGenerator = new QueryGenerator(serverUrl);
    queryPromise = queryGenerator.run();
  });

  it('Generates multiple queries', function() {
    this.timeout = 50000;

    return queryPromise
      .then(({queries, coverage}) =>{
          console.log(`Coverage: ${coverage.coverageRatio}`);
          console.log(`skipped fields: ${coverage.notCoveredFields}`);
          return Promise.all(queries.map(query => requestToGraphQL(serverUrl, query)));
      })
      .then(results => assert.equal(results.filter(x => x.statusCode !== 200).length, 0));
  });
});

function requestToGraphQL(serverUrl, query) {
  return new Promise((resolve, reject) => {
    request(serverUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body:JSON.stringify({
        "query": query,
        "variables": "{}",
        "operationName": null
      })
    }, function (err, result) {
      if (err) return reject(err);

      resolve(result)
    });
  });
}
```

This is an example of a test that will just check that it returns HTTP status code 200!  It would be also good to check if, say, the body contains an error section.  However, it's all up to you!


## Extras

### Opt out of certain queries

When annotating, if you add `+NOFOLLOW` in examples will prevent this path from being followed when creating queries

```graphql
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
  ignoredNoParameters: IgnoredSubtype
}
```

## Contributing
We welcome feedback!  Please create an issue for feedback or issues.  If you would like to contribute, open a PR and let's start talking!

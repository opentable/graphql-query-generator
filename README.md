# GraphQL Service Tester

GraphQL Service Tester (a fork of [graphql-query-generator](https://github.com/opentable/graphql-query-generator)) uses schema introspection to create integration tests automatically from the comments on the query and mutation! This can provide a lot of test coverage without having to write any lines of code. And give you some peace of mind when making changes to the service to help prevent regressions. This is a great tool to have run as part of your CI build.

## Example

By adding comments in this format you allow the tester to create a query that will test all the Playlist fields.

```graphql
type Query {
  # Examples:
  # playlist(id: "aihSOj7Qs0yzd6Kfc4x7Bg")
  playlist(id: ID!): Playlist
}
```

## Getting Started

To get a local copy up and running follow these simple example steps.

### Installation

1. Clone the repo

```sh
git clone https://github.com/chad-superhifi/graphql-service-tester.git
```

2. Install NPM packages

```sh
npm install
```

## Usage

Execute the following commands to get this tool running.

```
graphql-service-tester http://<your-server-address>:<your-server-port>
graphql-service-tester --help # for more information
```

## Features

- Test Queries And Mutations
- Response Time SLA Testing
- Data Passing Between Tests
- Dependency Ordering
- Query Directives
- Define Cleanup Tests That Run Last
- Array Assertions
- Opt-Out of Certain Queries

### Query And Mutations Testing

Both queries and mutations are supported.

```graphql
type Query {
  # Examples:
  # playlist(id: "aihSOj7Qs0yzd6Kfc4x7Bg")
  playlist(id: ID!): Playlist
}

type Mutation {
  # Examples:
  # createPlaylist(name: "Summer Mix")
  createPlaylist(name: String!): Playlist
}

type Playlist {
  id: ID!
  name: String!
}
```

### Directives

Directives allow adding additional functionality to the tests by adding `@directiveName` after the query. In the example below, `@last()` is a directive to allow the `removePlaylist()` mutation to run last. Queries support multiple directives.

```graphql
type Mutation {
  # Examples:
  # removePlaylist(id: "aihSOj7Qs0yzd6Kfc4x7Bg") @last()
  removePlaylist(id: ID!): Playlist
}
```

### Response Time SLA Directive

Add an `@sla` directive to your query to tell it how long it should take to run.

```graphql
type Query {
  # Examples:
  # playlist(id: "aihSOj7Qs0yzd6Kfc4x7Bg") @sla(maxResponseTime: "600ms")
  playlist(id: ID!): Playlist
}
```

If the tests take longer than the max response type the test runner will fail the test and output a message about the response time that was exceeded.

```
  playlist(id: "aihSOj7Qs0yzd6Kfc4x7Bg")       805ms

  SLA response time 600ms exceeded
```

The maxResponseTime must be a string and uses the [ms](https://github.com/vercel/ms#readme) library to parse the string with units into milliseconds.

```
"600ms", "2s", "1.2s"
```

### Multiple Queries and Aliasing

Multiple queries can be defined for a single API.

```text
   If multiple queries are used each query MUST have a unique alias.  Aliases are OPTIONAL if the API has a single query.
```

```graphql
type Mutation {
  # Examples:
  # summerPlaylist: createPlaylist(name: "Summer Mix")
  # fallPlaylist: createPlaylist(name: "Fall Mix")
  createPlaylist(name: String!): Playlist
}
```

### Data Passing Between Tests

The response from one query or mutation can be passed to the arguments of another query or mutation. This is especially helpful when something is being created with a server-generated `id` and you want to be able to run a query for an item with that `id`. In the example below the `createPlaylist` mutation returns a Playlist `fallPlaylist` with an `id`. We can pass the id to the `playlist` query using a [handlebars](https://handlebarsjs.com/)-like syntax.

The response data is stored in a variable using either the query name or the alias if one was used.

```graphql
type Mutation {
  # Examples:
  # fallPlaylist: createPlaylist(name: "Fall Mix")
  createPlaylist(name: String!): Playlist
}

type Query {
  # Examples:
  # playlist(id: "{{fallPlaylist.id}}")
  playlist(id: ID!): Playlist
}
```

### Dependency Ordering

When passing data between tests the tests become dependent on each other and the tests that are being referenced by other tests often must be run first. For example, to run the `playlist(id: "{{fallPlaylist.id}}")` query which references the `fallPlaylist: createPlaylist(name: "Fall Mix")` the `createPlaylist` must be run before `playlist`. Rather than having to worry about what order the tests should be run the tool will do a dependency analysis to order them.

```graphql
type Mutation {
  # Examples:
  # fallPlaylist: createPlaylist(name: "Fall Mix")
  createPlaylist(name: String!): Playlist
}

type Query {
  # Examples:
  # playlist(id: "{{fallPlaylist.id}}")
  playlist(id: ID!): Playlist
}
```

### Define cleanup tests that run last

When tests contain mutations that remove or archive data it's often necessary to do these steps at the end so any other tests that depend on that data existing or being active are not broken. The `@last()` directive can be added to a query to ensure all the tests marked with the directive are run after all the other tests.

```graphql
type Mutation {
  # Examples:
  # removePlaylist(id: "{{fallPlaylist.id}}") @last()
  removePlaylist(id: ID!): Playlist
}
```

### Array Assertions

The tester attempts to increase test coverage by retrieving every field available to query. However, when the fields contain arrays which return empty the coverage has a hole in due to the missing data. You can use the `@ensureMinimum` directive to cause the tester to assert that arrays you name have at least N items.

```graphql
type Query {
  # Examples:
  # searchPlaylists(term: "Mix") @ensureMinimum(nItems: 2, inArrays:["searchPlaylists", "searchPlaylists.tracks"])
  searchPlaylists(term: String!): [Playlist!]!
}

type Playlist {
  id: ID!
  name: String!
  tracks: [Track!]!
}

type Track {
  id: ID!
  title: String!
  artist: String!
  album: String!
}
```

### Opt-Out of Certain Queries

When annotating, if you add `+NOFOLLOW` in examples will prevent this query from running.

```graphql
type Query {
  # Examples:
  # +NOFOLLOW
  # ignoredQuery(name: "Ignore me")
  ignoredQuery(name: String): String
}
```

## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

## License

Distributed under the ISC License. See `LICENSE` for more information.

## Contact

Chad Bumstead - cbumstead@gmail.com

Project Link: [https://github.com/chad-superhifi/graphql-service-tester.git](https://github.com/chad-superhifi/graphql-service-tester.git)

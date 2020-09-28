import introspectionQuery from './introspectionQuery';
import query from './graphqlClient';
import schemaToQueries from './schemaToQueries';
import calculateCoverage from './coverageCalculator';

module.exports = function QueryGenerator(url) {
  function buildTypeDictionary(__schema) {
    let result = {};
    __schema.types.forEach(type => result[type.name] = type);
    return result;
  }

  this.run = function () {
    // Make a GraphQL POST passing in an introspection query to get back the schema
    return query(url, introspectionQuery)
      .then((res) => {
        if (!res.ok) {
          return res.text()
            .then((responseText) => {
              return Promise.reject(`Introspection query failed with status ${res.status}.\nResponse text:\n${responseText}`);
            });
        }
        return res.json();
      })
      .then(result => {
        const queryTypeName = result.data['__schema'].queryType.name;
        const typeDictionary = buildTypeDictionary(result.data['__schema']);
        // Each query can contain one or more tests.
        // Multiple queries are prefixed to prevent name collisions
        const queries = schemaToQueries(queryTypeName, typeDictionary);
        // Coverage stats do not take into consideration multiple tests on same query endpoint
        const coverage = calculateCoverage(queryTypeName, typeDictionary);
        return { queries, coverage };
      });
  };
};

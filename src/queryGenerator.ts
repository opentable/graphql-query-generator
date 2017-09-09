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
        const queries = schemaToQueries(queryTypeName, typeDictionary);
        const coverage = calculateCoverage(queryTypeName, typeDictionary);
        return { queries, coverage };
      });
  };
};

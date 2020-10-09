import introspectionQuery from './introspectionQuery';
import { queryClient } from './graphqlClient';
import schemaToQueries from './schemaToQueries';
import calculateCoverage from './coverageCalculator';

export default function QueryGenerator(url) {
  function buildTypeDictionary(__schema) {
    const result = {};
    __schema.types.forEach(type => (result[type.name] = type));
    return result;
  }

  this.run = function() {
    return queryClient(url, introspectionQuery, 'QUERY')
      .then(res => {
        if (!res.ok) {
          return res.text().then(responseText => {
            return Promise.reject(
              `Introspection query failed with status ${res.status}.\nResponse text:\n${responseText}`
            );
          });
        }
        return res.json();
      })
      .then(result => {
        const queryTypeName = result.data['__schema'].queryType.name;
        const mutationTypeName = result.data['__schema'].mutationType.name;
        const typeDictionary = buildTypeDictionary(result.data['__schema']);
        // Each query can contain one or more tests.
        // Multiple queries are prefixed to prevent name collisions
        const queries = schemaToQueries(queryTypeName, typeDictionary);
        const mutations = schemaToQueries(mutationTypeName, typeDictionary);
        const queryCoverage = calculateCoverage(queryTypeName, typeDictionary);
        const mutationCoverage = calculateCoverage(mutationTypeName, typeDictionary);

        const queriesAndMutations = [
          ...queries.map(query => ({ type: 'QUERY', query })),
          ...mutations.map(query => ({ type: 'MUTATION', query })),
        ];

        const coverage = {
          coverageRatio: queryCoverage.coverageRatio * mutationCoverage.coverageRatio,
          notCoveredFields: [...queryCoverage.notCoveredFields, ...mutationCoverage.notCoveredFields],
        };

        return { queries: queriesAndMutations, coverage };
      });
  };
}

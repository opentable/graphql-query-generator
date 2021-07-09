import { IMockServer } from './interfaces';
import introspectionQuery from './introspectionQuery';
import { queryClient } from './graphqlClient';
import schemaToQueries from './schemaToQueries';
import calculateCoverage from './coverageCalculator';

export default function QueryGenerator(server: string | IMockServer) {
  function buildTypeDictionary(__schema) {
    const result = {};
    __schema.types.forEach((type) => (result[type.name] = type));
    return result;
  }

  this.run = async function () {
    try {
      const introspectionResponse = await queryClient(server, introspectionQuery, 'QUERY');

      const queryTypeName = (introspectionResponse.data['__schema'].queryType || { name: 'Query' }).name;
      const mutationTypeName = (introspectionResponse.data['__schema'].mutationType || { name: 'Mutation' }).name;
      const typeDictionary = buildTypeDictionary(introspectionResponse.data['__schema']);
      // Each query can contain one or more tests.
      // Multiple queries are prefixed to prevent name collisions
      const queries = schemaToQueries(queryTypeName, typeDictionary);
      const mutations = schemaToQueries(mutationTypeName, typeDictionary);
      const queryCoverage = calculateCoverage(queryTypeName, typeDictionary);
      const mutationCoverage = calculateCoverage(mutationTypeName, typeDictionary);

      const queriesAndMutations = [
        ...queries.map((query) => ({ type: 'QUERY', query })),
        ...mutations.map((query) => ({ type: 'MUTATION', query })),
      ];

      const coverage = {
        coverageRatio: queryCoverage.coverageRatio * mutationCoverage.coverageRatio,
        notCoveredFields: [...queryCoverage.notCoveredFields, ...mutationCoverage.notCoveredFields],
      };

      return { queries: queriesAndMutations, coverage };
    } catch (error) {
      throw new Error(`Introspection query failed.\nResponse text:\n${error.message}`);
    }
  };
}

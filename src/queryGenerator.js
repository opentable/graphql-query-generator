var introspectionQuery_1 = require('./introspectionQuery');
var graphqlClient_1 = require('./graphqlClient');
var schemaToQueries_1 = require('./schemaToQueries');
var coverageCalculator_1 = require('./coverageCalculator');
function QueryGenerator(url) {
    function buildTypeDictionary(__schema) {
        var result = {};
        __schema.types.forEach(function (type) { return (result[type.name] = type); });
        return result;
    }
    this.run = function () {
        return graphqlClient_1.queryClient(url, introspectionQuery_1["default"], 'QUERY')
            .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (responseText) {
                    return Promise.reject("Introspection query failed with status " + res.status + ".\nResponse text:\n" + responseText);
                });
            }
            return res.json();
        })
            .then(function (result) {
            var queryTypeName = result.data['__schema'].queryType.name;
            var mutationTypeName = result.data['__schema'].mutationType.name;
            var typeDictionary = buildTypeDictionary(result.data['__schema']);
            // Each query can contain one or more tests.
            // Multiple queries are prefixed to prevent name collisions
            var queries = schemaToQueries_1["default"](queryTypeName, typeDictionary);
            var mutations = schemaToQueries_1["default"](mutationTypeName, typeDictionary);
            var queryCoverage = coverageCalculator_1["default"](queryTypeName, typeDictionary);
            var mutationCoverage = coverageCalculator_1["default"](mutationTypeName, typeDictionary);
            var queriesAndMutations = queries.map(function (query) { return ({ type: 'QUERY', query: query }); }).concat(mutations.map(function (query) { return ({ type: 'MUTATION', query: query }); }));
            var coverage = {
                coverageRatio: queryCoverage.coverageRatio * mutationCoverage.coverageRatio,
                notCoveredFields: queryCoverage.notCoveredFields.concat(mutationCoverage.notCoveredFields)
            };
            return { queries: queriesAndMutations, coverage: coverage };
        });
    };
}
exports["default"] = QueryGenerator;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const introspectionQuery_1 = __importDefault(require("./introspectionQuery"));
const graphqlClient_1 = require("./graphqlClient");
const schemaToQueries_1 = __importDefault(require("./schemaToQueries"));
const coverageCalculator_1 = __importDefault(require("./coverageCalculator"));
function QueryGenerator(server) {
    function buildTypeDictionary(__schema) {
        const result = {};
        __schema.types.forEach((type) => (result[type.name] = type));
        return result;
    }
    this.run = function () {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const introspectionResponse = yield graphqlClient_1.queryClient(server, introspectionQuery_1.default, 'QUERY');
                const queryTypeName = (introspectionResponse.data['__schema'].queryType || { name: 'Query' }).name;
                const mutationTypeName = (introspectionResponse.data['__schema'].mutationType || { name: 'Mutation' }).name;
                const typeDictionary = buildTypeDictionary(introspectionResponse.data['__schema']);
                // Each query can contain one or more tests.
                // Multiple queries are prefixed to prevent name collisions
                const queries = schemaToQueries_1.default(queryTypeName, typeDictionary);
                const mutations = schemaToQueries_1.default(mutationTypeName, typeDictionary);
                const queryCoverage = coverageCalculator_1.default(queryTypeName, typeDictionary);
                const mutationCoverage = coverageCalculator_1.default(mutationTypeName, typeDictionary);
                const queriesAndMutations = [
                    ...queries.map((query) => ({ type: 'QUERY', query })),
                    ...mutations.map((query) => ({ type: 'MUTATION', query })),
                ];
                const coverage = {
                    coverageRatio: queryCoverage.coverageRatio * mutationCoverage.coverageRatio,
                    notCoveredFields: [...queryCoverage.notCoveredFields, ...mutationCoverage.notCoveredFields],
                };
                return { queries: queriesAndMutations, coverage };
            }
            catch (error) {
                throw new Error(`Introspection query failed.\nResponse text:\n${error.message}`);
            }
        });
    };
}
exports.default = QueryGenerator;
//# sourceMappingURL=queryGenerator.js.map
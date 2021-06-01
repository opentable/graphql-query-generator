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
exports.queryClient = void 0;
const axios_1 = __importDefault(require("axios"));
function createQuery(query, type) {
    if (type !== 'QUERY' && type !== 'MUTATION') {
        throw new Error(`createQuery unsupported type ${type}`);
    }
    const body = {
        query,
        variables: {},
        operationName: null,
    };
    return JSON.stringify(body);
}
function queryClient(server, query, type = 'QUERY') {
    return __awaiter(this, void 0, void 0, function* () {
        const isString = typeof server === 'string' || server instanceof String;
        const finalQuery = `${type === 'MUTATION' ? 'mutation ' : ''}${query}`;
        if (isString) {
            try {
                const response = yield axios_1.default({
                    url: server,
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    data: createQuery(finalQuery, type),
                });
                return response.data;
            }
            catch (error) {
                console.error('axios error', error);
                return error.response.data || { errors: { message: error.stack } } || error;
            }
        }
        else {
            const response = yield server.query(finalQuery, {});
            return response;
        }
    });
}
exports.queryClient = queryClient;
//# sourceMappingURL=graphqlClient.js.map
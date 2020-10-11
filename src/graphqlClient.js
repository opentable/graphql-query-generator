var node_fetch_1 = require('node-fetch');
function createQuery(query, type) {
    if (type !== 'QUERY' && type !== 'MUTATION') {
        throw new Error("createQuery unsupported type " + type);
    }
    var body = {
        query: "" + (type === 'MUTATION' ? 'mutation ' : '') + query,
        variables: {},
        operationName: null
    };
    return JSON.stringify(body);
}
async;
function queryClient(url, query, type) {
    if (type === void 0) { type = 'QUERY'; }
    return node_fetch_1["default"](url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: createQuery(query, type)
    });
}

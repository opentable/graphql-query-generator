import fetch from 'node-fetch';

function createQuery(query, type) {
  if (type !== 'QUERY' && type !== 'MUTATION') {
    throw new Error(`createQuery unsupported type ${type}`);
  }

  const body = {
    query: `${type === 'MUTATION' ? 'mutation ' : ''}${query}`,
    variables: {},
    operationName: null,
  };

  return JSON.stringify(body);
}

export function queryClient(url, graphQuery, type = 'QUERY') {
  const queryPromise = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createQuery(graphQuery, type),
  });

  return queryPromise;
}

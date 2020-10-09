import fetch from 'node-fetch';

function createQuery(query: string, type: string) {
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

export async function queryClient(url: string, query: string, type = 'QUERY'): Promise<any> {
  return fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createQuery(query, type),
  });
}

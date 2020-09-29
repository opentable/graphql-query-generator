import * as fetch from 'node-fetch';

function createQuery(query, type) {
  if(type !== 'QUERY' && type !== 'MUTATION'){
    throw new Error('createQuery Unsupported type' + type)
  }

  var body = {
    "query": `${type === 'MUTATION' ? 'mutation ' :  ''}${query}`,
    "variables": {},
    "operationName": null
  };

  return JSON.stringify(body);
}

export function queryClient(url, graphQuery, type) {
  const queryPromise = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createQuery(graphQuery, type)
  });

  return queryPromise;
}

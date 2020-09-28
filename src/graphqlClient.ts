import * as fetch from 'node-fetch';

function createMutation(mutation) {
  var body = {
    "query": `mutation ${mutation}`,
    "variables": {},
    "operationName": null
  };

  return JSON.stringify(body);
}

function createQuery(query) {
  var body = {
    "query": query,
    "variables": {},
    "operationName": null
  };

  return JSON.stringify(body);
}

export function mutationClient(url, graphMutation) {
  const queryPromise = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createMutation(graphMutation)
  });

  return queryPromise;
}

export function queryClient(url, graphQuery) {
  const queryPromise = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createQuery(graphQuery)
  });

  return queryPromise;
}

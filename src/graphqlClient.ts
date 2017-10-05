import * as fetch from 'node-fetch';

function createQuery(query) {
  var body = {
    "query": query,
    "variables": {},
    "operationName": null
  };

  return JSON.stringify(body);
}

export default function query(url, graphQuery) {
  const queryPromise = fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: createQuery(graphQuery)
  });

  return queryPromise;
}

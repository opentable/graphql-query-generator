import axios from 'axios';

function createQuery(query: string, type: string) {
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

export async function queryClient(server: string | IMockServer, query: string, type = 'QUERY') {
  const isString = typeof server === 'string' || server instanceof String;
  const finalQuery = `${type === 'MUTATION' ? 'mutation ' : ''}${query}`;

  if (isString) {
    const response = await axios({
      url: server as string,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      data: createQuery(finalQuery, type),
    });

    if (response.status !== 200) {
      return response.data;
    }
    return response.data;
  } else {
    const response = await (server as IMockServer).query(finalQuery, {});
    return response;
  }
}

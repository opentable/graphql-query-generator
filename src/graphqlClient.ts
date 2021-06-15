import { IMockServer } from './interfaces';
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
    try {
      const response = await axios({
        url: server as string,
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        data: createQuery(finalQuery, type),
      });
      return response?.data || {};
    } catch (error) {
      // console.error('axios error', error);
      return error.response?.data || { errors: [{ message: error.stack }] } || error;
    }
  } else {
    const response = await (server as IMockServer).query(finalQuery, {});
    return response;
  }
}

import { forEachSeries } from 'p-iteration';
import { queryClient } from '../graphqlClient';
import QueryGenerator from '../queryGenerator';
import GraphQLQuery from './queryClass';

export async function runGraphQLTests(url: string, progressCallback): Promise<Array<any>> {
  const queryGenerator = new QueryGenerator(url);

  let responseData = {};

  const reportData: Array<any> = [];

  const { queries: queryStrings } = await queryGenerator.run();

  const queries = queryStrings.map((qs) => new GraphQLQuery(qs.query, qs.type)) as [GraphQLQuery];

  // Setup dependent queries
  queries.forEach((query) => {
    query.parameters.forEach((parameter) => {
      // Get the variable/alias name from the param string
      const [alias] = parameter.split('.');
      const dependent = queries.find((query) => query.alias === alias);
      if (dependent) {
        query.dependents.push(dependent);
      }
    });
  });

  // Walk dependency chain and reorder

  await forEachSeries(queries, async (item) => {
    const report = {
      query: item,
      run: { start: new Date(), end: new Date(), ms: 0, isExpected: true },
      errors: [],
      status: 'in progress',
    };

    try {
      progressCallback && progressCallback(report.query.name, 0, queries.length);

      // Look for parameter $mytrack.audio.name and plug it in
      const pluggedInQuery = pluginParameter(item.query, responseData);

      report.run.start = new Date();
      const res = await queryClient(url, pluggedInQuery, item.type);
      report.run.end = new Date();

      report.run.ms = Math.abs(+report.run.start - +report.run.end);
      report.run.isExpected = Boolean(report.run.ms <= (report.query.sla.responseTime || 3000));
      // if (!report.run.isExpected) {
      //   throw new Error('response time exceeded SLA');
      // }

      const response = await res.json();

      const hasErrors = response.errors;

      if (hasErrors) {
        response.errors.map((error) => logErrorToReport(report, error));
      } else {
        // Store responses in memory so they can be used for an argument to another query/mutation call
        responseData = { ...responseData, ...response.data };
        report.status = 'passed';
      }
    } catch (error) {
      logErrorToReport(report, error);
    }
    progressCallback && progressCallback(report.query.name, 1, queries.length);
    reportData.push(report);
  });

  return reportData;
}

function pluginParameter(query, responseData) {
  if (query.parameters.length > 0) {
    const param = query.parameters[0];
    // Eval using parameter against responseData to get value to plugin
    try {
      const value = eval(`responseData.${param}`);
      // Replace $ parameter with actual value
      const pluggedInQuery = query.replace(param, value);
      return pluggedInQuery;
    } catch {
      throw Error(`could not find $${param}`);
    }
  }
  return query;
}

function logErrorToReport(report, error) {
  const errorMessage = error.message || error;
  report.errors.push(errorMessage);
  report.status = 'failed';
  // console.log(error);
}

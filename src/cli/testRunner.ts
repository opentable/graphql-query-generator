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

  await forEachSeries(queries, async (item) => {
    const report = {
      query: item,
      run: { start: new Date(), end: new Date(), ms: 0 },
      errors: [],
      status: 'in progress',
    };

    try {
      progressCallback && progressCallback(report.query.name, 0, queries.length);

      // Look for parameter $mytrack.audio.name and extract it
      const pluggedInQuery = parseAndPluginParameter(item.query, responseData);

      report.run.start = new Date();
      const res = await queryClient(url, pluggedInQuery, item.type);
      report.run.end = new Date();

      report.run.ms = Math.abs(+report.run.start - +report.run.end);

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

function parseAndPluginParameter(query, responseData) {
  const regex = /(\$[^")]*)/;

  let matches;
  if ((matches = regex.exec(query)) !== null) {
    const match = matches[0];
    const param = match.replace('$', '');
    // Eval using parameter against responseData to get value to plugin
    try {
      const value = eval(`responseData.${param}`);
      // Replace $ parameter with actual value
      const pluggedInQuery = query.replace(match, value);
      return pluggedInQuery;
    } catch {
      throw Error(`could not find ${match}`);
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

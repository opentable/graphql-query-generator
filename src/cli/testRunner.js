var p_iteration_1 = require('p-iteration');
var queryGenerator_1 = require('../queryGenerator');
var queryClass_1 = require('../queryClass');
async;
function runGraphQLTests(url, progressCallback) {
    var queryGenerator = new queryGenerator_1["default"](url);
    var responseData = {};
    var reportData = [];
    var queryStrings = await.queries, queryGenerator, run = ();
    var queries = queryStrings.map(function (qs) { return new queryClass_1["default"](qs.query, qs.type); }), as = [queryClass_1["default"]];
    // Setup dependent queries
    queries.forEach(function (query) {
        query.parameters.forEach(function (parameter) {
            // Get the variable/alias name from the param string
            var alias = parameter.split('.')[0];
            var dependent = queries.find(function (query) { return query.alias === alias; });
            if (dependent) {
                query.dependents.push(dependent);
            }
        });
    });
    // Walk dependency tree depth first to reorder
    var walkDependents = function (queries) {
        if (!queries.length) {
            return [];
        }
        var visited = [];
        queries.forEach(function (query) {
            if (!query.isVisited) {
                visited = visited.concat(walkDependents(query.dependents));
                query.isVisited = true;
                visited.push(query);
            }
        });
        return visited;
    };
    var notLastQueries = queries.filter(function (query) { return !query.isLast; });
    var lastQueries = queries.filter(function (query) { return query.isLast; });
    var notLastOrdered = walkDependents(notLastQueries);
    var lastOrdered = walkDependents(lastQueries);
    var orderedQueries = notLastOrdered.concat(lastOrdered);
    await;
    p_iteration_1.forEachSeries.apply(void 0, [orderedQueries, async(item), {
        const: report = {
            query: item,
            run: { start: new Date(), end: new Date(), ms: 0, meetsSLA: true },
            errors: [],
            status: 'passed'
        },
        try: {
            progressCallback:  && progressCallback(report.query.name, 0, orderedQueries.length),
            // Look for parameter {{mytrack.audio.name}} and plug it in
            item: .pluggedInQuery = pluginParameters(item, responseData),
            report: .run.start = new Date(),
            const: res = await, queryClient: function (url, item, pluggedInQuery, item, type) { },
            report: .run.end = new Date(),
            report: .run.ms = Math.abs(+report.run.start - +report.run.end),
            const: sla = report.query.sla,
            report: .run.meetsSLA = Boolean(report.run.ms <= (sla ? sla.responseTime : 15000)),
            // if (!report.run.isExpected) {
            //   throw new Error('response time exceeded SLA');
            // }
            const: response = await, res: .json(),
            const: hasErrors = response.errors,
            if: function (hasErrors) {
                response.errors.map(function (error) { return logErrorToReport(report, 'API Error: ' + error.message); });
            }, else: {
                // Store responses in memory so they can be used for an argument to another query/mutation call
                responseData:  = {} } } }].concat(responseData, response.data));
}
;
var minimums = item.ensureMinimum;
// Ensure minimums are met
if (minimums) {
    minimums.arrays.forEach(function (field) {
        var parts = field.split('.');
        var currentField = '';
        var reference = response.data;
        parts.forEach(function (part) {
            if (Array.isArray(reference)) {
                var isValid_1 = reference.length >= minimums.items;
                console.log(currentField, isValid_1);
                if (!isValid_1) {
                    logErrorToReport(report, currentField + " array (length " + reference.length + ") did not meet min length " + minimums.items);
                }
                reference = reference[0];
                currentField += '[0]';
            }
            reference = reference[part];
            currentField += '.' + part;
        });
        var isValid = reference.length >= minimums.items;
        if (!isValid) {
            logErrorToReport(report, currentField + " array (length " + reference.length + ") did not meet min length " + minimums.items);
        }
    });
}
try { }
catch (error) {
    logErrorToReport(report, error);
}
progressCallback && progressCallback(report.query.name, 1, orderedQueries.length);
reportData.push(report);
;
return reportData;
function pluginParameters(query, responseData) {
    var pluggedInQuery = query.query;
    query.parameters.forEach(function (param) {
        // Eval using parameter against responseData to get value to plugin
        try {
            var parts = param.split('.');
            var currentField = '';
            var reference = responseData;
            parts.forEach(function (part) {
                if (Array.isArray(reference)) {
                    reference = reference[0];
                    currentField += '[0]';
                }
                reference = reference[part];
                currentField += '.' + part;
            });
            var value = reference;
            // Replace {{parameter}} with actual value
            pluggedInQuery = pluggedInQuery.replace("{{" + param + "}}", value);
        }
        catch () {
            throw Error("could not find {{" + param + "}}");
        }
    });
    return pluggedInQuery;
}
function logErrorToReport(report, error) {
    var errorMessage = error.message || error;
    report.errors.push(errorMessage);
    report.status = 'failed';
    // console.log(error);
}

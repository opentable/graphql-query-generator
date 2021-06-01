"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runGraphQLTests = void 0;
const p_iteration_1 = require("p-iteration");
const graphqlClient_1 = require("../graphqlClient");
const queryGenerator_1 = __importDefault(require("../queryGenerator"));
const queryClass_1 = __importDefault(require("../queryClass"));
function runGraphQLTests(server, progressCallback) {
    return __awaiter(this, void 0, void 0, function* () {
        const queryGenerator = new queryGenerator_1.default(server);
        let responseData = {};
        const reportData = [];
        const { queries: queryStrings } = yield queryGenerator.run();
        const queries = queryStrings.map((qs) => new queryClass_1.default(qs.query, qs.type));
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
        // Walk dependency tree depth first to reorder
        const walkDependents = (queries, depth = 0) => {
            if (!queries.length || depth > 100) {
                return [];
            }
            let visited = [];
            queries.forEach((query) => {
                if (!query.isVisited) {
                    visited = visited.concat(walkDependents(query.dependents, depth + 1));
                    query.isVisited = true;
                    visited.push(query);
                }
            });
            return visited;
        };
        const notLastQueries = queries.filter((query) => !query.isLast);
        const lastQueries = queries.filter((query) => query.isLast);
        const notLastOrdered = walkDependents(notLastQueries);
        const lastOrdered = walkDependents(lastQueries);
        const orderedQueries = notLastOrdered.concat(lastOrdered);
        yield p_iteration_1.forEachSeries(orderedQueries, (item) => __awaiter(this, void 0, void 0, function* () {
            const report = {
                query: item,
                run: { start: new Date(), end: new Date(), ms: 0, meetsSLA: true },
                errors: [],
                status: 'passed',
            };
            try {
                progressCallback && progressCallback(report.query.name, 0, orderedQueries.length);
                if (report.query.wait) {
                    // console.log('sleeping (ms)', report.query.wait.waitTime);
                    yield sleep(report.query.wait.waitTime);
                }
                // Look for parameter {{mytrack.audio.name}} and plug it in
                item.pluggedInQuery = pluginParameters(item.query, item, responseData, queries);
                item.pluggedInArgs = pluginParameters(item.args, item, responseData, queries);
                report.run.start = new Date();
                const response = yield graphqlClient_1.queryClient(server, item.pluggedInQuery, item.type);
                report.run.end = new Date();
                report.run.ms = Math.abs(+report.run.start - +report.run.end);
                const sla = report.query.sla;
                report.run.meetsSLA = Boolean(report.run.ms <= (sla ? sla.responseTime : 120000));
                const errors = response.errors;
                if (errors) {
                    console.log('ERRORS: ', errors);
                    errors.map((error) => logErrorToReport(report, 'API Error: ' + error.message));
                }
                else {
                    // Store responses in memory so they can be used for an argument to another query/mutation call
                    responseData = Object.assign(Object.assign({}, responseData), response.data);
                    const minimums = item.ensureMinimum;
                    // Ensure minimums are met
                    if (minimums) {
                        minimums.arrays.forEach((field) => {
                            const parts = field.split('.');
                            let currentField = '';
                            let reference = response.data;
                            parts.forEach((part) => {
                                if (Array.isArray(reference)) {
                                    const isValid = reference.length >= minimums.items;
                                    //  console.log(currentField, isValid);
                                    if (!isValid) {
                                        logErrorToReport(report, `${currentField} array (length ${reference.length}) did not meet min length ${minimums.items}`);
                                    }
                                    reference = reference[0];
                                    currentField += '[0]';
                                }
                                currentField += '.' + part;
                                reference = reference[part];
                                if (reference === undefined) {
                                    throw new Error(`@ensureMinimum could not find ${currentField}`);
                                }
                            });
                            const isValid = reference.length >= minimums.items;
                            if (!isValid) {
                                logErrorToReport(report, `${currentField} array (length ${reference.length}) did not meet min length ${minimums.items}`);
                            }
                        });
                    }
                }
            }
            catch (error) {
                logErrorToReport(report, error);
            }
            progressCallback && progressCallback(report.query.name, 1, orderedQueries.length);
            reportData.push(report);
        }));
        return reportData;
    });
}
exports.runGraphQLTests = runGraphQLTests;
function pluginParameters(inputString, query, responseData, queries) {
    let pluggedInQuery = inputString;
    query.parameters.forEach((param) => {
        // Eval using parameter against responseData to get value to plugin
        try {
            const parts = param.split('.');
            const [alias] = parts;
            let currentField = '';
            let reference = responseData;
            parts.forEach((part) => {
                if (Array.isArray(reference)) {
                    reference = reference[0];
                    currentField += '[0]';
                }
                if (part === '$ARGS') {
                    // Get target query
                    const targetQuery = queries.find((q) => q.alias === alias);
                    if (targetQuery === undefined) {
                        throw new Error(`pluginParameters could not find ${currentField}`);
                    }
                    const targetArgs = eval((targetQuery.pluggedInArgs || targetQuery.args).replace('(', '({').replace(')', '})'));
                    reference = targetArgs;
                }
                else {
                    currentField += '.' + part;
                    reference = reference[part];
                    if (reference === undefined) {
                        throw new Error(`pluginParameters could not find ${currentField}`);
                    }
                }
            });
            const value = reference;
            // Replace {{parameter}} with actual value
            pluggedInQuery = pluggedInQuery.replace(`{{${param}}}`, value);
        }
        catch (ex) {
            console.log(ex);
            throw Error(`could not find {{${param}}}`);
        }
    });
    return pluggedInQuery;
}
function logErrorToReport(report, error) {
    const errorMessage = error.message || error;
    report.errors.push(errorMessage);
    report.status = 'failed';
}
function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}
//# sourceMappingURL=testRunner.js.map
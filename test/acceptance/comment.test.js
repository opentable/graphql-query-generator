var exampleServer_1 = require('./exampleServer');
var queryGenerator_1 = require('../../src/queryGenerator');
var serverUrl = 'http://localhost:12345/graphql';
var report;
var queries;
var mutations;
var coverage;
beforeAll(async(done), {
    // Start service
    await: exampleServer_1["default"],
    const: queryGenerator = new queryGenerator_1["default"](serverUrl),
    report:  = await, queryGenerator: .run(),
    queries:  = report.queries.filter(function (query) { return query.type === 'QUERY'; }).map(function (q) { return q.query; }),
    mutations:  = report.queries.filter(function (query) { return query.type === 'MUTATION'; }).map(function (q) { return q.query; }),
    coverage:  = report.coverage,
    done: function () { }
});
describe('Query generation', function () {
    it('Generates multiple queries', function () {
        expect(queries).toEqual(expect.arrayContaining([expect.stringMatching(/rollDice/)]));
    });
    it('Generates multiple mutations', function () {
        expect(mutations).toEqual(expect.arrayContaining([expect.stringMatching(/createGame/)]));
    });
    it('Ignores fields with +NOFOLLOW in description', function () {
        expect(queries.filter(function (q) { return q.match(/ignoredWithExamples/g); }).length).toEqual(0);
        expect(queries.filter(function (q) { return q.match(/ignoredNoParameters/g); }).length).toEqual(0);
    });
    it('Uses Examples section for scalar fields with non-nullable args', function () {
        expect(queries.filter(function (q) { return q.match(/rollXTimes\(times. [0-9]+\)/g); }).length).toEqual(4);
    });
    it('Calculates valid coverage', function () {
        expect(coverage.coverageRatio).toBeGreaterThanOrEqual(0);
        expect(coverage.coverageRatio).toBeLessThanOrEqual(1);
        if (coverage.coverageRatio < 1.0) {
            expect(coverage.notCoveredFields.length).toBeGreaterThanOrEqual(1);
        }
        else {
            expect(coverage.notCoveredFields.length).toEqual(0);
        }
    });
});

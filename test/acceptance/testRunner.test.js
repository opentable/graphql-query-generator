var serverUrl = 'http://localhost:12345/graphql';
var report;
beforeAll(async(done), {
    // Start service
    // await service;
    report:  = await, runGraphQLTests: function (serverUrl) { },
    done: function () { }
});
describe('Test Runner', function () {
    it('Report should not have errors', function () {
        expect(report[0].errors.length).toBe(0);
    });
});

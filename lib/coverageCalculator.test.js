"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const coverageCalculator_1 = __importDefault(require("./coverageCalculator"));
const mockData_1 = __importDefault(require("./mockData"));
describe('Coverage calculator', () => {
    it('Full coverage', () => {
        expect(coverageCalculator_1.default('ObjectContainingTwoDeeplyNestedObjects', mockData_1.default)).toEqual({
            coverageRatio: 1,
            notCoveredFields: [],
        });
    });
    it('Partial coverage', () => {
        expect(coverageCalculator_1.default('DeeplyNestedObjectWithPartialNoFollow', mockData_1.default)).toEqual({
            coverageRatio: 0.5,
            notCoveredFields: [
                'DeeplyNestedObject___NOFollowPart',
                'DeeplyNestedObject___DeeplyNestedObject___DeepNest',
                'DeeplyNestedObject___ObjectField___NotSoDeepNest',
            ],
        });
    });
});
//# sourceMappingURL=coverageCalculator.test.js.map
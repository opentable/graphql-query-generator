import coverageCalculator from './coverageCalculator';
import mockData from './mockData';
describe('Coverage calculator', () => {
  it('Full coverage', () => {
    expect(coverageCalculator('ObjectContainingTwoDeeplyNestedObjects', mockData)).toEqual({
      coverageRatio: 1,
      notCoveredFields: [],
    });
  });
  it('Partial coverage', () => {
    expect(coverageCalculator('DeeplyNestedObjectWithPartialNoFollow', mockData)).toEqual({
      coverageRatio: 0.5,
      notCoveredFields: [
        'DeeplyNestedObject___NOFollowPart',
        'DeeplyNestedObject___DeeplyNestedObject___DeepNest',
        'DeeplyNestedObject___ObjectField___NotSoDeepNest',
      ],
    });
  });
});

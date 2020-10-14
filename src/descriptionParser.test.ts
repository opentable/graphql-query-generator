import { getExamplesFrom, shouldFollow } from './descriptionParser';

describe('Example description parser', () => {
  it('simple query', () => {
    expect(getExamplesFrom('Examples:country(cId: 1)')).toEqual(['country(cId: 1)']);
  });
  it('aliased query', () => {
    expect(getExamplesFrom('Examples:mycountry:country(cId: 1)')).toEqual(['mycountry:country(cId: 1)']);
  });
  it('@tag directive query', () => {
    expect(getExamplesFrom('Examples:country(cId: 1) @tag(name:"country")')).toEqual([
      'country(cId: 1) @tag(name:"country")',
    ]);
  });
  it('@ensureMinimum directive query', () => {
    expect(
      getExamplesFrom('Examples:country(cId: 1) @ensureMinimum(nItems: 1, inArrays: ["country.locations"])')
    ).toEqual(['country(cId: 1) @ensureMinimum(nItems: 1, inArrays: ["country.locations"])']);
  });
  it('handlebar param in query', () => {
    expect(getExamplesFrom('Examples:country(cId: "{{mycountry.id}}")')).toEqual(['country(cId: "{{mycountry.id}}")']);
  });
  it('Example spelled wrong', () => {
    expect(getExamplesFrom('Emples:country(cId: 1)')).toEqual([]);
  });
  it('simple query with space', () => {
    expect(getExamplesFrom('Examples: country(cId: 1)')).toEqual(['country(cId: 1)']);
  });
  it('simple query with newline', () => {
    expect(getExamplesFrom('Examples:\ncountry(cId: 1)')).toEqual(['country(cId: 1)']);
  });
  it('simple query Example', () => {
    expect(getExamplesFrom('Example:country(cId: 1)')).toEqual(['country(cId: 1)']);
  });
  it('simple query argument with no whitespace', () => {
    expect(getExamplesFrom('Example:country(cId:1)')).toEqual(['country(cId:1)']);
  });
  it('simple query two arguments', () => {
    expect(getExamplesFrom('Examples:country(cId: 1, cName: "Test")')).toEqual(['country(cId: 1, cName: "Test")']);
  });
  it('two queries', () => {
    expect(getExamplesFrom('Examples:country(cId: 1, cName: "Test")\nmetro(mId: 100)')).toEqual([
      'country(cId: 1, cName: "Test")',
      'metro(mId: 100)',
    ]);
  });
  it('+NOFOLLOW after Examples: and newline', () => {
    expect(shouldFollow('Examples:country(\ncId: 1\n)\n+NOFOLLOW\n')).toEqual(false);
  });
  it('+NOFOLLOW after Examples: and newline and space', () => {
    expect(shouldFollow('Examples:country(\ncId: 1\n)\n +NOFOLLOW\n')).toEqual(false);
  });
  it('+NOFOLLOW before Examples: and newline', () => {
    expect(shouldFollow('+NOFOLLOW\nExamples:country(\ncId: 1\n)')).toEqual(false);
  });
  it('+NOFOLLOW before Examples: and newline and space', () => {
    expect(shouldFollow(' +NOFOLLOW\nExamples:country(\ncId: 1\n)')).toEqual(false);
  });
  it('+NOFOLLOW after Examples without newline', () => {
    expect(shouldFollow('Examples+NOFOLLOW:country(\ncId: 1\n)')).toEqual(true);
  });
  it('+NOFOLLOW after query without newline', () => {
    expect(shouldFollow('Examples:country(\ncId: 1\n)+NOFOLLOW')).toEqual(true);
  });
});

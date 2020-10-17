"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const descriptionParser_1 = require("./descriptionParser");
describe('Example description parser', () => {
    it('simple query', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:country(cId: 1)')).toEqual(['country(cId: 1)']);
    });
    it('aliased query', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:mycountry:country(cId: 1)')).toEqual(['mycountry:country(cId: 1)']);
    });
    it('@tag directive query', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:country(cId: 1) @tag(name:"country")')).toEqual([
            'country(cId: 1) @tag(name:"country")',
        ]);
    });
    it('@ensureMinimum directive query', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:country(cId: 1) @ensureMinimum(nItems: 1, inArrays: ["country.locations"])')).toEqual(['country(cId: 1) @ensureMinimum(nItems: 1, inArrays: ["country.locations"])']);
    });
    it('handlebar param in query', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:country(cId: "{{mycountry.id}}")')).toEqual(['country(cId: "{{mycountry.id}}")']);
    });
    it('Example spelled wrong', () => {
        expect(descriptionParser_1.getExamplesFrom('Emples:country(cId: 1)')).toEqual([]);
    });
    it('simple query with space', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples: country(cId: 1)')).toEqual(['country(cId: 1)']);
    });
    it('simple query with newline', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:\ncountry(cId: 1)')).toEqual(['country(cId: 1)']);
    });
    it('simple query Example', () => {
        expect(descriptionParser_1.getExamplesFrom('Example:country(cId: 1)')).toEqual(['country(cId: 1)']);
    });
    it('simple query argument with no whitespace', () => {
        expect(descriptionParser_1.getExamplesFrom('Example:country(cId:1)')).toEqual(['country(cId:1)']);
    });
    it('simple query two arguments', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:country(cId: 1, cName: "Test")')).toEqual(['country(cId: 1, cName: "Test")']);
    });
    it('two queries', () => {
        expect(descriptionParser_1.getExamplesFrom('Examples:country(cId: 1, cName: "Test")\nmetro(mId: 100)')).toEqual([
            'country(cId: 1, cName: "Test")',
            'metro(mId: 100)',
        ]);
    });
    it('+NOFOLLOW after Examples: and newline', () => {
        expect(descriptionParser_1.shouldFollow('Examples:country(\ncId: 1\n)\n+NOFOLLOW\n')).toEqual(false);
    });
    it('+NOFOLLOW after Examples: and newline and space', () => {
        expect(descriptionParser_1.shouldFollow('Examples:country(\ncId: 1\n)\n +NOFOLLOW\n')).toEqual(false);
    });
    it('+NOFOLLOW before Examples: and newline', () => {
        expect(descriptionParser_1.shouldFollow('+NOFOLLOW\nExamples:country(\ncId: 1\n)')).toEqual(false);
    });
    it('+NOFOLLOW before Examples: and newline and space', () => {
        expect(descriptionParser_1.shouldFollow(' +NOFOLLOW\nExamples:country(\ncId: 1\n)')).toEqual(false);
    });
    it('+NOFOLLOW after Examples without newline', () => {
        expect(descriptionParser_1.shouldFollow('Examples+NOFOLLOW:country(\ncId: 1\n)')).toEqual(true);
    });
    it('+NOFOLLOW after query without newline', () => {
        expect(descriptionParser_1.shouldFollow('Examples:country(\ncId: 1\n)+NOFOLLOW')).toEqual(true);
    });
});
//# sourceMappingURL=descriptionParser.test.js.map
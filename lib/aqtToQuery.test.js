"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const aqtToQuery_1 = __importDefault(require("./aqtToQuery"));
describe('Query tree to graphql string', () => {
    it('single prop', () => {
        expect(aqtToQuery_1.default('name')).toEqual('name');
    });
    it('multiple of different name prop', () => {
        expect(aqtToQuery_1.default(['name', 'surname', 'age'])).toEqual('name surname age ');
    });
    it('multiple of same name prop', () => {
        //TODO: Should fix to output name name1:name name2:name
        expect(aqtToQuery_1.default(['name', 'name', 'name'])).toEqual('name name name ');
    });
    it('convert nested string or array to object', () => {
        expect(aqtToQuery_1.default({ people: 'name', countries: ['flag'] })).toEqual('people { name }countries { flag  }');
    });
    it('handle array', () => {
        expect(aqtToQuery_1.default(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a'] }])).toEqual('id name coordinates { lat long  } test { a  } ');
    });
});
//# sourceMappingURL=aqtToQuery.test.js.map
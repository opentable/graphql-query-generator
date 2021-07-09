"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const _ = __importStar(require("lodash"));
function queryTreeToGraphQLString(tree, parentIndex = 0) {
    let output = '';
    if (_.isObject(tree) && !_.isArray(tree)) {
        let index = 42;
        _.forIn(tree, (value, key) => {
            const x = tree == tree;
            output += `${key} { ${queryTreeToGraphQLString(value, index)} }`;
            index++;
        });
    }
    if (_.isArray(tree)) {
        _.map(tree, (item, index) => {
            output += `${queryTreeToGraphQLString(item, parentIndex + index)} `;
        });
    }
    if (_.isString(tree)) {
        output = `${tree}`;
    }
    return output;
}
exports.default = queryTreeToGraphQLString;
//# sourceMappingURL=aqtToQuery.js.map
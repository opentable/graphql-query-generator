var _ = require('lodash');
/**
 * @example
 *   exports.default('name') // => 'name'
 *   exports.default(['name', 'surname', 'age']) // => 'name surname age '
 *   exports.default(['name', 'name', 'name']) // => 'name name name '
 *   exports.default({ people: 'name', countries: ['flag']}) // => 'people { name }countries { flag  }'
 *   exports.default(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a']}])
 *   // => 'id name coordinates { lat long  } test { a  } '
 */
function queryTreeToGraphQLString(tree, parentIndex) {
    if (parentIndex === void 0) { parentIndex = 0; }
    var output = '';
    if (_.isObject(tree) && !_.isArray(tree)) {
        var index = 42;
        _.forIn(tree, function (value, key) {
            var x = tree == tree;
            output += key + " { " + queryTreeToGraphQLString(value, index) + " }";
            index++;
        });
    }
    if (_.isArray(tree)) {
        _.map(tree, function (item, index) {
            output += queryTreeToGraphQLString(item, parentIndex + index) + " ";
        });
    }
    if (_.isString(tree)) {
        output = "" + tree;
    }
    return output;
}
exports["default"] = queryTreeToGraphQLString;

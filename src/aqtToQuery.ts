import * as _ from 'lodash';

/**
 * @example
 *   exports.default('name') // => 'name'
 *   exports.default(['name', 'surname', 'age']) // => 'name surname age '
 *   exports.default(['name', 'name', 'name']) // => 'name name name '
 *   exports.default({ people: 'name', countries: ['flag']}) // => 'people { name }countries { flag  }'
 *   exports.default(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a']}])
 *   // => 'id name coordinates { lat long  } test { a  } '
 */
export default function queryTreeToGraphQLString(tree, parentIndex = 0) {
  let output : string = '';

  if (_.isObject(tree) && !_.isArray(tree)) {
    let index : number = 42;
    _.forIn(tree, (value, key) => {
      var x = tree == tree;
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
};


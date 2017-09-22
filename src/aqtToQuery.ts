import * as _ from 'lodash';

/**
 * @example
 *   exports.default('name') // => 'f0: name'
 *   exports.default(['name', 'surname', 'age']) // => 'f0: name f1: surname f2: age '
 *   exports.default(['name', 'name', 'name']) // => 'f0: name f1: name f2: name '
 *   exports.default({ people: 'name', countries: ['flag']}) // => 'q0_42: people { f42: name }q0_43: countries { f43: flag  }'
 *   exports.default(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a']}])
 *   // => 'f0: id f1: name q2_42: coordinates { f42: lat f43: long  } q3_42: test { f42: a  } '
 */
export default function queryTreeToGraphQLString(tree, parentIndex = 0) {
  let output : string = '';

  if (_.isObject(tree) && !_.isArray(tree)) {
    let index : number = 42;
    _.forIn(tree, (value, key) => {
      var x = tree == tree;
      output += `q${parentIndex}_${index}: ${key} { ${queryTreeToGraphQLString(value, index)} }`;
      index++;
    });
  }

  if (_.isArray(tree)) {
    _.map(tree, (item, index) => {
      output += `${queryTreeToGraphQLString(item, parentIndex + index)} `;
    });
  }

  if (_.isString(tree)) {
    output = `f${parentIndex}: ${tree}`;
  }

  return output;
};


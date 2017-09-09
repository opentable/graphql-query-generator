import _ from 'lodash';

/**
 * @example
 *   module.exports('name') // => 'name'
 *   module.exports(['name', 'surname', 'age']) // => 'name surname age '
 *   module.exports({ people: 'name', countries: ['flag']}) // => 'q0_42: people { name }q0_43: countries { flag  }'
 *   module.exports(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a']}])
 *   // => 'id name q2_42: coordinates { lat long  } q3_42: test { a  } '
 */
module.exports = function queryTreeToGraphQLString(tree, parentIndex = 0) {
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
      output += `${queryTreeToGraphQLString(item, index)} `;
    });
  }

  if (_.isString(tree)) {
    output = `${tree}`;
  }

  return output;
};


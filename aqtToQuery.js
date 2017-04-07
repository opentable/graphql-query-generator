const _ = require('lodash');

/**
 * @example
 *   module.exports('name') // => 'name'
 *   module.exports(['name', 'surname', 'age']) // => 'name surname age '
 *   module.exports({ people: 'name', countries: ['flag']}) // => 'people { name }countries { flag  }'
 */
module.exports = function queryTreeToGraphQLString(tree) {
  let output = '';

  if (_.isObject(tree) && !_.isArray(tree)) {
    let index = 42;
    _.forIn(tree, (value, key) => {
      output += `q${index}: ${key} { ${queryTreeToGraphQLString(value)} }`;
      index++;
    });
  }

  if (_.isArray(tree)) {
    _.map(tree, (item) => {
      output += `${queryTreeToGraphQLString(item)} `;
    });
  }

  if (_.isString(tree)) {
    output = `${tree}`;
  }

  return output;
}


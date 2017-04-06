const _ = require('lodash');
module.exports = function queryTreeToGraphQLString(tree) {
  let output = '';

  if (_.isObject(tree) && !_.isArray(tree)) {
    _.forIn(tree, (value, key) => {
      output += `${key} { ${queryTreeToGraphQLString(value)} }`;
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


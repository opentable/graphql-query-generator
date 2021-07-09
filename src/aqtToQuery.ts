import * as _ from 'lodash';

export default function queryTreeToGraphQLString(tree, parentIndex = 0) {
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

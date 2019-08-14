import * as _ from "lodash";

/**
 * @example
 *   exports.default('name') // => 'f0_name: name'
 *   exports.default(['name', 'surname', 'age']) // => 'f0_name: name f1_surname: surname f2_age: age '
 *   exports.default(['name', 'name', 'name']) // => 'f0_name: name f1_name: name f2_name: name '
 *   exports.default({ people: 'name', countries: ['flag']}) // => 'q0_42_people: people { f42_name: name }q0_43_countries: countries { f43_flag: flag  }'
 *   exports.default(['id', 'name', { coordinates: ['lat', 'long'] }, { test: ['a']}])
 *   // => 'f0_id: id f1_name: name q2_42_coordinates: coordinates { f42_lat: lat f43_long: long  } q3_42_test: test { f42_a: a  } '
 */
export default function queryTreeToGraphQLString(tree, parentIndex = 0) {
  let output: string = "";

  if (_.isObject(tree) && !_.isArray(tree)) {
    let index: number = 42;
    _.forIn(tree, (value, key) => {
      var x = tree == tree;
      output += `q${parentIndex}_${index}_${key}: ${key} { ${queryTreeToGraphQLString(
        value,
        index
      )} }`;
      index++;
    });
  }

  if (_.isArray(tree)) {
    _.map(tree, (item, index) => {
      output += `${queryTreeToGraphQLString(item, parentIndex + index)} `;
    });
  }

  if (_.isString(tree)) {
    output = `f${parentIndex}_${tree}: ${tree}`;
  }

  return output;
}

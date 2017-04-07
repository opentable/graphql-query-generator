const _ = require('lodash');
//const test = new RegExp(/Example[s]?:\s*(\s*(?:([_A-Za-z][_0-9A-Za-z]*)\s*\(([^\)])*\))\s*)+/);  
const examplesSection = new RegExp(/Example[s]?:/);

/*
['Examples:', 'Examples: ','Examples:\n', 'Example:']
   .forEach(exampleStartSection => 
    ['country(cId: 1)', 'country (cId: 1)', 'country (cId:1)',
    'country (cId :1)', 'country (\ncId :1\n)']
*/


/**
 * @example
 *   module.exports('Emples:country(cId: 1)') // => []
 *   module.exports('Emples:countrycId: 1)') // => []
 *   module.exports('Examples:country(cId: 1)') // => ['country(cId: 1)']
 *   module.exports('Examples: country(cId: 1)') // => ['country(cId: 1)']
 *   module.exports('Examples:\ncountry(cId: 1)') // => ['country(cId: 1)']
 *   module.exports('Example:country(cId: 1)') // => ['country(cId: 1)']
 *   module.exports('Examples: country(cId:1)') // => ['country(cId:1)']
 *   module.exports('Examples:country(\ncId: 1\n)') // => ['country(\ncId: 1\n)']
 *   module.exports('Examples:country(cId: 1, cName: "Test")') // => ['country(cId: 1, cName: "Test")']
 *   module.exports('Examples:country(cId: 1, cName: "Test")\nmetro(mId: 100)') // => ['country(cId: 1, cName: "Test")', 'metro(mId: 100)']
 */
module.exports = function getExamplesFrom(comment) {
  if(!comment) {
    return [];
  }
  
  const what = comment.split(examplesSection);
  if(what.length !== 2) return [];
  const examplesDescription = what[1];
  let result = [];
  let matches = null;
  const test = new RegExp(/(\s*([_A-Za-z]\w*)\s*\([^)]*\)\s*)/g);
  while( (matches = test.exec(examplesDescription)) && matches.length > 1)
  {
    result.push(matches[1].trim());
  }
  
  return result;
}
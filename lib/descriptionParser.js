const examplesSection = new RegExp(/Example[s]?:/);

module.exports = {
  /**
   * @example
   *   module.exports.getExamplesFrom('Emples:country(cId: 1)') // => []
   *   module.exports.getExamplesFrom('Emples:countrycId: 1)') // => []
   *   module.exports.getExamplesFrom('Examples:country(cId: 1)') // => ['country(cId: 1)']
   *   module.exports.getExamplesFrom('Examples: country(cId: 1)') // => ['country(cId: 1)']
   *   module.exports.getExamplesFrom('Examples:\ncountry(cId: 1)') // => ['country(cId: 1)']
   *   module.exports.getExamplesFrom('Example:country(cId: 1)') // => ['country(cId: 1)']
   *   module.exports.getExamplesFrom('Examples: country(cId:1)') // => ['country(cId:1)']
   *   module.exports.getExamplesFrom('Examples:country(\ncId: 1\n)') // => ['country(\ncId: 1\n)']
   *   module.exports.getExamplesFrom('Examples:country(cId: 1, cName: "Test")') // => ['country(cId: 1, cName: "Test")']
   *   module.exports.getExamplesFrom('Examples:country(cId: 1, cName: "Test")\nmetro(mId: 100)') // => ['country(cId: 1, cName: "Test")', 'metro(mId: 100)']
   */
  getExamplesFrom: function getExamplesFrom(comment) {
    if (!comment) {
      return [];
    }

    const what = comment.split(examplesSection);
    if (what.length !== 2) return [];
    const examplesDescription = what[1];
    let result = [];
    let matches = null;
    const test = new RegExp(/(\s*([_A-Za-z]\w*)\s*\([^)]*\)\s*)/g);
    // Forgive me
    while ((matches = test.exec(examplesDescription)) && matches.length > 1) {
      result.push(matches[1].trim());
    }

    return result;
  },
  /**
   * @example
   *   module.exports.shouldFollow('Examples:country(\ncId: 1\n)\n+NOFOLLOW\n') // => false
   *   module.exports.shouldFollow('Examples:country(\ncId: 1\n)\n +NOFOLLOW\n') // => false
   *   module.exports.shouldFollow('+NOFOLLOW\nExamples:country(\ncId: 1\n)') // => false
   *   module.exports.shouldFollow(' +NOFOLLOW\nExamples:country(\ncId: 1\n)') // => false
   *   module.exports.shouldFollow('Examples+NOFOLLOW:country(\ncId: 1\n)') // => true
   *   module.exports.shouldFollow('Examples:country(\ncId: 1\n)+NOFOLLOW') // => true
   */
  shouldFollow: function shouldFollow(description) {
    if (!description) {
      return true;
    }

    return description.match(/(^\s*\+NOFOLLOW|\n\s*\+NOFOLLOW)/) === null;
  }
};
const examplesSection = new RegExp(/Example[s]?:/);

export default {
  /**
   * @example
   *  exports.default.getExamplesFrom('Examples:mycountry:country(cId: 1)') // => ['mycountry:country(cId: 1)']
   *  exports.default.getExamplesFrom('Examples:mycountry:country(cId: 1) @tag(name:"country")') // => ['mycountry:country(cId: 1) @tag(name:"country")']
   *  exports.default.getExamplesFrom('Examples:country(cId: $mycountry.id)') // => ['country(cId: $mycountry.id)']
   *  exports.default.getExamplesFrom('Emples:country(cId: 1)') // => []
   *  exports.default.getExamplesFrom('Emples:countrycId: 1)') // => []
   *  exports.default.getExamplesFrom('Examples:country(cId: 1)') // => ['country(cId: 1)']
   *  exports.default.getExamplesFrom('Examples: country(cId: 1)') // => ['country(cId: 1)']
   *  exports.default.getExamplesFrom('Examples:\ncountry(cId: 1)') // => ['country(cId: 1)']
   *  exports.default.getExamplesFrom('Example:country(cId: 1)') // => ['country(cId: 1)']
   *  exports.default.getExamplesFrom('Examples: country(cId:1)') // => ['country(cId:1)']
   *  exports.default.getExamplesFrom('Examples:country(\ncId: 1\n)') // => ['country(\ncId: 1\n)']
   *  exports.default.getExamplesFrom('Examples:country(cId: 1, cName: "Test")') // => ['country(cId: 1, cName: "Test")']
   *  exports.default.getExamplesFrom('Examples:country(cId: 1, cName: "Test")\nmetro(mId: 100)') // => ['country(cId: 1, cName: "Test")', 'metro(mId: 100)']
   */
  getExamplesFrom: function getExamplesFrom(comment) {
    if (!comment) {
      return [];
    }

    const what = comment.split(examplesSection);
    if (what.length !== 2) return [];
    const examplesDescription = what[1]; 
    let result : Array<any> = [];
    let matches : any | null = null;
    const test = new RegExp(/(?<signature>\s*(?<name>[ _A-Za-z:]*)\s*\([^)]*\)\s*)(?<directive>@[A-Za-z]*\(?[A-Za-z:"']*\)?)?\s*/g);
    // Forgive me
    while ((matches = test.exec(examplesDescription)) && matches.length > 1) {
      result.push(matches[0].trim());
    }

    return result;
  },

  /**
   * @example
   *  exports.default.shouldFollow('Examples:country(\ncId: 1\n)\n+NOFOLLOW\n') // => false
   *  exports.default.shouldFollow('Examples:country(\ncId: 1\n)\n +NOFOLLOW\n') // => false
   *  exports.default.shouldFollow('+NOFOLLOW\nExamples:country(\ncId: 1\n)') // => false
   *  exports.default.shouldFollow(' +NOFOLLOW\nExamples:country(\ncId: 1\n)') // => false
   *  exports.default.shouldFollow('Examples+NOFOLLOW:country(\ncId: 1\n)') // => true
   *  exports.default.shouldFollow('Examples:country(\ncId: 1\n)+NOFOLLOW') // => true
   */
  shouldFollow(description) {
    if (!description) {
      return true;
    }

    return description.match(/(^\s*\+NOFOLLOW|\n\s*\+NOFOLLOW)/) === null;
  }
};

// module.exports.default.getExamplesFrom('Examples:country(cId: 1, cName: "Test")') //?
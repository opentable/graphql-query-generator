"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.shouldFollow = exports.getExamplesFrom = void 0;
const examplesSection = new RegExp(/Example[s]?:/);
function getExamplesFrom(comment) {
    if (!comment) {
        return [];
    }
    const what = comment.split(examplesSection);
    if (what.length !== 2)
        return [];
    const examplesDescription = what[1];
    const result = [];
    let matches = null;
    const test = new RegExp(/(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*(?<args>\([^)]*\))\s*(?<directives>@[\w]*\([^)]*\))*/g);
    while ((matches = test.exec(examplesDescription)) && matches.length > 1) {
        const { groups } = matches;
        if (groups.alias && !groups.name) {
            groups.name = groups.alias;
            groups.alias = undefined;
        }
        const query = `${groups.alias || ''}${groups.alias ? ':' : ''}${groups.name}${groups.args}${groups.directives ? ' ' + groups.directives : ''}`;
        result.push(query);
    }
    return result;
}
exports.getExamplesFrom = getExamplesFrom;
function shouldFollow(description) {
    if (!description) {
        return true;
    }
    return description.match(/(^\s*\+NOFOLLOW|\n\s*\+NOFOLLOW)/) === null;
}
exports.shouldFollow = shouldFollow;
//# sourceMappingURL=descriptionParser.js.map
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ms_1 = __importDefault(require("ms"));
class GraphQLQuery {
    constructor(query, type) {
        this.parameters = [];
        this.dependents = [];
        this.isVisited = false;
        this.toString = () => `${this.query}`;
        let alias, name;
        this.type = type;
        const regex = /(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*(?<args>\([^)]*\))\s*(?<directive>@[\w]*\([^)]*\))*/g;
        let matches;
        if ((matches = regex.exec(query)) !== null) {
            const { groups } = matches;
            alias = groups.alias;
            name = groups.name;
            this.directive = groups.directive;
            this.args = groups.args;
            this.query = query.replace(this.directive, '');
            const paramRegex = /{{(?<parameter>[^"]*)}}/g;
            let paramMatches;
            while ((paramMatches = paramRegex.exec(this.args)) && paramMatches.length > 1) {
                const parameter = paramMatches.groups['parameter'];
                this.parameters.push(parameter);
            }
        }
        else {
            let matches;
            if ((matches = /{\s*(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*}/g.exec(query)) !== null) {
                alias = matches.groups['alias'];
                name = matches.groups['name'];
            }
            this.query = query;
        }
        // If there's an alias and no name
        // They got mixed up.
        if (alias && !name) {
            this.name = alias;
            this.alias = name;
        }
        else {
            this.name = name;
            this.alias = alias;
        }
        this.pluggedInQuery = this.query;
    }
    get tags() {
        const tag = getRegexMatchGroup(/(name\s*:\s*['"](?<tag>[\w]*)['"])/g, this.directive, 'tag');
        return tag ? [tag] : [];
    }
    get isLast() {
        const last = getRegexMatchGroup(/(?<last>@last)/g, this.directive, 'last');
        return Boolean(last);
    }
    get sla() {
        const responseTime = getRegexMatchGroup(/(maxResponseTime\s*:\s*['"]\s*(?<responseTime>.*)\s*['"])/g, this.directive, 'responseTime');
        return responseTime ? { responseTime: ms_1.default(responseTime) } : null;
    }
    get ensureMinimum() {
        const items = getRegexMatchGroup(/(nItems\s*:\s*(?<items>[\w]*)\s*)/g, this.directive, 'items') || '1';
        const stringArrays = getRegexMatchGroup(/(inArrays:\s*(?<arrays>[^)]*)\s*)/g, this.directive, 'arrays');
        if (!stringArrays) {
            return null;
        }
        const arrays = stringArrays
            .replace('[', '')
            .replace(']', '')
            .split(',')
            .map((str) => str.trim().replace('"', '').replace('"', ''));
        return { items: Number.parseInt(items), arrays };
    }
    get signature() {
        return `${this.name}${this.args || ''}`;
    }
}
exports.default = GraphQLQuery;
function getRegexMatchGroup(regex, val, groupName) {
    let matches;
    if ((matches = regex.exec(val)) !== null && matches.groups[groupName]) {
        return matches.groups[groupName];
    }
    return null;
}
//# sourceMappingURL=queryClass.js.map
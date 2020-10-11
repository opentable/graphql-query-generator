var _this = this;
var GraphQLQuery = (function () {
    function GraphQLQuery(query, type) {
        this.readonly = query;
        this.readonly = type;
        this.readonly = alias;
        this.readonly = name;
        this.readonly = directive;
        this.readonly = args;
        this.readonly = parameters;
        this.string = (_a = [], _a);
        this.readonly = dependents;
        this.isVisited = false;
        var alias, name;
        this.type = type;
        var regex = new RegExp(/(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*(?<args>\([^)]*\))\s*(?<directive>@[\w]*\([^)]*\))*/g);
        var matches;
        if ((matches = regex.exec(query)) !== null) {
            var groups = matches.groups;
            alias = groups.alias;
            name = groups.name;
            this.directive = groups.directive;
            this.args = groups.args;
            this.query = query.replace(this.directive, '');
            var paramRegex = new RegExp(/{{(?<parameter>[^"]*)}}/g);
            var paramMatches;
            while ((paramMatches = paramRegex.exec(this.args)) && paramMatches.length > 1) {
                var parameter = paramMatches.groups['parameter'];
                this.parameters.push(parameter);
            }
        }
        else {
            var matches_1;
            if ((matches_1 = new RegExp(/{\s*(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*}/g).exec(query)) !== null) {
                alias = matches_1.groups['alias'];
                name = matches_1.groups['name'];
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
        var _a;
    }
    GraphQLQuery.prototype.Array = ;
    Object.defineProperty(GraphQLQuery.prototype, "tags", {
        get: function () {
            var tag = getRegexMatchGroup(new RegExp(/(name:['"](?<tag>[\w]*)['"])/g), this.directive, 'tag');
            return tag ? [tag] : [];
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphQLQuery.prototype, "isLast", {
        get: function () {
            var last = getRegexMatchGroup(new RegExp(/(?<last>@last)/g), this.directive, 'last');
            return Boolean(last);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GraphQLQuery.prototype, "sla", {
        get: function () { },
        enumerable: true,
        configurable: true
    });
    return GraphQLQuery;
})();
exports["default"] = GraphQLQuery;
null;
{
    var responseTime = getRegexMatchGroup(new RegExp(/(maxResponseTime:['"](?<responseTime>[\w]*)['"])/g), this.directive, 'responseTime');
    return responseTime ? { responseTime: ms_1["default"](responseTime) } : null;
}
get;
ensureMinimum();
{
    items: number;
    arrays: string[];
}
 | null;
{
    var items = getRegexMatchGroup(new RegExp(/(nItems:\s*(?<items>[\w]*)\s*)/g), this.directive, 'items') || '1';
    var stringArrays = getRegexMatchGroup(new RegExp(/(inArrays:\s*(?<arrays>[^)]*)\s*)/g), this.directive, 'arrays');
    if (!stringArrays) {
        return null;
    }
    var arrays = stringArrays
        .replace('[', '')
        .replace(']', '')
        .split(',')
        .map(function (str) { return str.trim().replace('"', '').replace('"', ''); });
    return { items: Number.parseInt(items), arrays: arrays };
}
get;
signature();
string;
{
    return "" + this.name + (this.args || '');
}
toString = function () { return ("" + _this.query); };
function getRegexMatchGroup(regex, val, groupName) {
    var matches;
    if ((matches = regex.exec(val)) !== null && matches.groups[groupName]) {
        return matches.groups[groupName];
    }
    return null;
}

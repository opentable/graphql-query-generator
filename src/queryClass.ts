const ms = require('ms');

export default class GraphQLQuery {
  readonly query: string;

  readonly type: string;

  readonly alias: string;

  readonly name: string;

  readonly directive: string;

  readonly args: string;

  readonly parameters: string[] = [];

  readonly dependents: Array<GraphQLQuery> = [];

  isVisited = false;

  constructor(query: string, type: string) {
    this.type = type;
    const regex = new RegExp(
      /(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*(?<args>\([^)]*\))\s*(?<directive>@[\w]*\([^)]*\))*/g
    );
    let matches;
    if ((matches = regex.exec(query)) !== null) {
      const { groups } = matches;
      if (groups.alias && !groups.name) {
        groups.name = groups.alias;
        groups.alias = undefined;
      }
      this.alias = groups.alias;
      this.name = groups.name;
      this.directive = groups.directive;
      this.args = groups.args;
      this.query = query.replace(this.directive, '');

      let paramMatches;
      if ((paramMatches = /(\$[^")]*)/.exec(this.args)) !== null) {
        const match = paramMatches[0];
        this.parameters = [match.replace('$', '')];
      }
    }
  }

  get tags(): string[] {
    const tag = getRegexMatchGroup(new RegExp(/(name:['"](?<tag>[\w]*)['"])/g), this.directive, 'tag');
    return tag ? [tag] : [];
  }

  get sla(): { responseTime: number } | null {
    const responseTime = getRegexMatchGroup(
      new RegExp(/(maxResponseTime:['"](?<responseTime>[\w]*)['"])/g),
      this.directive,
      'responseTime'
    );
    return responseTime ? { responseTime: ms(responseTime) } : null;
  }

  get ensureMinimum(): { items: number; arrays: string[] } | null {
    const items = getRegexMatchGroup(new RegExp(/(nItems:\s*(?<items>[\w]*)\s*)/g), this.directive, 'items') || '1';
    const stringArrays = getRegexMatchGroup(new RegExp(/(inArrays:\s*(?<arrays>[^)]*)\s*)/g), this.directive, 'arrays');
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

  get signature(): string {
    return `${this.name}${this.args}`;
  }

  public toString = (): string => `${this.query}`;
}

function getRegexMatchGroup(regex, val, groupName) {
  let matches;
  if ((matches = regex.exec(val)) !== null && matches.groups[groupName]) {
    return matches.groups[groupName];
  }
  return null;
}

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

  constructor(query: string, type: string) {
    this.type = type;
    const regex = new RegExp(
      /(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*(?<args>\([^)]*\))\s*(?<directive>@[\w]*\(?[\w:"']*\)?)*/g
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
    const regex = new RegExp(/(name:['"](?<tag>[\w]*)['"])/g);
    let matches;
    if ((matches = regex.exec(this.directive)) !== null) {
      return [matches.groups.tag];
    }
    return [] as string[];
  }

  get sla(): { responseTime: number } {
    const regex = new RegExp(/(maxResponseTime:['"](?<responseTime>[\w]*)['"])/g);
    let matches;
    if ((matches = regex.exec(this.directive)) !== null && matches.groups.responseTime) {
      return { responseTime: ms(matches.groups.responseTime) };
    }
    return {} as { responseTime: number };
  }

  get signature(): string {
    return `${this.name}${this.args}`;
  }

  public toString = (): string => `${this.query}`;
}

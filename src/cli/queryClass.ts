export default class GraphQLQuery {
  readonly query: string;

  readonly type: string;

  readonly alias: string;

  readonly name: string;

  readonly directive: string;

  readonly args: string;

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

  get signature(): string {
    return `${this.name}${this.args}`;
  }

  public toString = (): string => `${this.alias || ''}${this.alias ? ':' : ''}${this.name}${this.args}`;
}

const examplesSection = new RegExp(/Example[s]?:/);

export function getExamplesFrom(comment) {
  if (!comment) {
    return [];
  }

  const what = comment.split(examplesSection);
  if (what.length !== 2) return [];
  const examplesDescription = what[1];
  const result: Array<any> = [];
  let matches: any | null = null;
  const test = new RegExp(
    /(?<alias>[\w]*)?\s*:?\s*(?<name>[\w]*)\s*(?<args>\([^)]*\))\s*(?<directives>@[\w]*\([^)]*\))*/g
  );

  while ((matches = test.exec(examplesDescription)) && matches.length > 1) {
    const { groups } = matches;
    if (groups.alias && !groups.name) {
      groups.name = groups.alias;
      groups.alias = undefined;
    }
    const query = `${groups.alias || ''}${groups.alias ? ':' : ''}${groups.name}${groups.args}${
      groups.directives ? ' ' + groups.directives : ''
    }`;
    result.push(query);
  }

  return result;
}

export function shouldFollow(description) {
  if (!description) {
    return true;
  }

  return description.match(/(^\s*\+NOFOLLOW|\n\s*\+NOFOLLOW)/) === null;
}

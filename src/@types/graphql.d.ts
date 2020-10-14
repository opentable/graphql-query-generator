// This is to help TS recognize the schema.graphql file
// Not currently being used
declare module '*.graphql' {
  import { DocumentNode } from 'graphql';
  const Schema: DocumentNode;

  export = Schema;
}

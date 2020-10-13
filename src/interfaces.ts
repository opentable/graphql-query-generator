interface IMockServer {
  query(query: string, variables: any): Promise<any>;
}

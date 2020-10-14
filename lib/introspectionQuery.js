"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `{
  __schema{
    queryType {
      name
    }
    mutationType {
      name
    }
    types {
      name
      kind
      fields {
        name
        type {
          name
          ofType {
            kind
            name
            ofType {
              kind
              name
              ofType {
                kind
                name
              }
            }
          }
        }
        description
        args {
          name
          type {
            kind
            ofType {
              kind
            }
          }
          defaultValue
        }
      }
    }
  }
}`;
//# sourceMappingURL=introspectionQuery.js.map
import introspectionQuery from "./introspectionQuery";
import query from "./graphqlClient";
import schemaToQueries from "./schemaToQueries";
import calculateCoverage from "./coverageCalculator";

module.exports = function QueryGenerator(urlOrFunction) {
  function buildTypeDictionary(__schema) {
    let result = {};
    __schema.types.forEach(type => (result[type.name] = type));
    return result;
  }

  this.run = function() {
    let instrospectionPromise: Promise<any>;
    if (typeof urlOrFunction === "function") {
      instrospectionPromise = urlOrFunction(introspectionQuery);
    } else {
      instrospectionPromise = query(urlOrFunction, introspectionQuery).then(
        res => {
          if (!res.ok) {
            return res.text().then(responseText => {
              return Promise.reject(
                `Introspection query failed with status ${
                  res.status
                }.\nResponse text:\n${responseText}`
              );
            });
          }
          return res.json();
        }
      );
    }
    return instrospectionPromise.then(result => {
      const queryTypeName = result.data["__schema"].queryType.name;
      const typeDictionary = buildTypeDictionary(result.data["__schema"]);
      const queries = schemaToQueries(queryTypeName, typeDictionary);
      const coverage = calculateCoverage(queryTypeName, typeDictionary);
      return { queries, coverage };
    });
  };
};

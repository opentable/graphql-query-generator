const introspectionQuery = require('./introspectionQuery');
const query = require('./graphqlClient');
const schemaToQueries = require('./schemaToQueries');

module.exports = function Wizard(url) {
  function buildTypeDictionary(__schema) {
    let result = {};
    __schema.types.forEach(type => result[type.name] = type);
    return result;
  }

  this.run = function () {
    return query(url, introspectionQuery)
      .then((res) => res.json())
      .then(result => {
        try {
          const queries = schemaToQueries(result.data['__schema'].queryType.name, buildTypeDictionary(result.data['__schema']));
          queries.forEach(query => {
            console.log(query);
            console.log('=========================');
          });
          return queries;
        }
        catch (ex) {
          console.log(ex);
        }
      });
  };
};


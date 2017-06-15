const introspectionQuery = require('./introspectionQuery');
const query = require('./graphqlClient');
const schemaToQueries = require('./schemaToQueries');

module.exports = function QueryGenerator(url) {
  function buildTypeDictionary(__schema) {
    let result = {};
    __schema.types.forEach(type => result[type.name] = type);
    return result;
  }

  this.run = function () {
    return query(url, introspectionQuery)
      .then((res) => {
        if(!res.ok) {
          return res.text()
            .then((responseText) => {
              return Promise.reject(`Introspection query failed with status ${res.status}.\nResponse text:\n${responseText}`);
            });
        }
        return res.json();
      })
      .then(result => {
        const queries = schemaToQueries(result.data['__schema'].queryType.name, buildTypeDictionary(result.data['__schema']));
        return queries;
      });
  };
};

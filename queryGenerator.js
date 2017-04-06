const introspectionQuery = require('./introspectionQuery');
const query = require('./graphqlClient');

module.exports = function Wizard(topMostStuff, url) {
  const schemaConverter = require('./schemaConverterForWizard');

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
          const queries = schemaConverter.schemaToQueries(buildTypeDictionary(result.data['__schema']));
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


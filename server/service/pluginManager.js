'use strict';

var fs      = require('fs');

module.exports = function(app) {
  var pluginsPath = null;

  var pluginLoader = {
    getPluginList: function () {
      var pluginList  = {};

      fs.readdirSync(pluginsPath).forEach(function (element) {
        if (fs.lstatSync(pluginsPath + element).isDirectory()) {
          var plugin = require(pluginsPath + element + '/plugin.js')(app);

          pluginList[element] = plugin;
        }
      });

      return pluginList;
    },
    module: function (moduleId) {
      pluginsPath = __dirname + '/../../modules/' + moduleId + '/plugins/';

      return this;
    }
  };

  return pluginLoader;
};

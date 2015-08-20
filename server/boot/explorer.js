'use strict';

module.exports = function mountLoopBackExplorer(server) {
  var explorer;
  try {
    explorer = require('loopback-explorer');
  } catch(err) {
    console.log(
      'Run `npm install loopback-explorer` to enable the LoopBack explorer'
    );
    return;
  }
  
  var restApiRoot = server.get('restApiRoot');
  var path     = require('path');
  var protocol = server.get('env') === "cluster" ? 'https' : 'http';
  
  // Explorer custom skin
  var explorerApp = explorer(server, { basePath: restApiRoot, protocol:protocol, uiDirs: path.resolve(__dirname, '../explorer')  });
  server.use('/explorer', explorerApp);
  server.once('started', function() {
    var baseUrl = server.get('url').replace(/\/$/, '');
    // express 4.x (loopback 2.x) uses `mountpath`
    // express 3.x (loopback 1.x) uses `route`
    var explorerPath = explorerApp.mountpath || explorerApp.route;
    console.log('Browse your REST API at %s%s', baseUrl, explorerPath);
  });
};

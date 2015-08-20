'use strict';

var loopback        = require('loopback'),
  cors              = require('cors'),
  path              = require('path'),
  boot              = require('loopback-boot'),
  loopbackModule    = require('loopback-module'),
  bunyan            = require('bunyan');

var app = module.exports = loopback();

require('./errors.js');

if (! app.get('env')) {
  console.log('Please specify environment configuration');

  return;
}

app.pluginManager = require('./service/pluginManager')(app);

if (! process.env.LOG_LEVEL) {
  process.env.LOG_LEVEL = 'info';
}

var log = function (module) {
  if (! module) {
    module = 'app';
  }

  var loggers = {};

  if (loggers[module]) {
    return loggers[module];
  }

  loggers[module] = bunyan.createLogger({
    name: module,
    src: true,
    level: process.env.LOG_LEVEL
  });

  return loggers[module];
};

app.log = log;

app.BaseModuleClass = require('../modules/baseModuleClass.js')(app);

/**
 * Booting application
 * And loading models for modules
 */
loopbackModule.init(
  app,
  boot,
  {}
);

app.loopbackModule = loopbackModule;

var options = loopbackModule.getBootOptions();

boot.ConfigLoader.loadAppConfig(__dirname, app.get('env'));

// Setting up CORS configuration
app.set('remoting', {
  'cors': {
    origin: true,
    credentials: true
  }
});

// Establish our overly-permissive CORS rules.
app.use(cors({
  origin: true,
  credentials: true
}));

app.use(loopback.favicon());
app.use(loopback.logger('dev'));

app.use(loopback.static(path.resolve(__dirname, '../client')));

boot(app, options);

var analytic = function (eventType) {
  return {
    log: function (data) {
      app.module['analytic'].log(eventType, data);
    }
  };
};

app.analytic = analytic;

// Configure models when all models set-up
loopbackModule.afterBoot(app);

app.use(loopback.methodOverride());

app.use(loopback.context());
app.use(loopback.token({model: app.models.accessToken}));
app.use(loopback.json());

app.use(loopback.static(path.join(__dirname, 'public')));

app.use(loopback.urlNotFound());

// The ultimate error handler.
app.use(loopback.errorHandler());

//removes X-Powered-By header
app.set('x-powered-by', false);

var consoleTasks = require('nanopay-console-tasks')(app);

var isGenerator = process.env.LOOPBACK_SDK_GENERATOR || false;

if (! consoleTasks.intercept() && ! isGenerator) {
  app.start = function() {
    var protocol = app.get('env') === "cluster" ? 'https://' : 'http://';
    //var protocol = "http://";  // set for now until https has been fully tested
    var baseURL = protocol + app.get('host') + ':' + app.get('port');

    return app.listen(app.get('port'), app.get('host'), function() {
      app.emit('started', baseURL);

      console.log('LoopBack server listening @ %s%s', baseURL, '/');
    });
  };

  if (require.main === module) {
    app.start();
  }
}


'use strict';
/**
 * Loopback console tasks
 *
 * @company Nanopay inc.
 * @year 2014
 * @author Alex Strutsynskyi cajoy.dev@gmail.com
 */

var _defaults = require('lodash.defaults');
var fs        = require('fs');

module.exports = consoleTasks;

function consoleTasks(app, options) {
  options = _defaults({}, options, {
    'tasksPath': require('path').resolve() + '/server/tasks/'
  });

  var cls = {};

  cls.intercept = function () {
    var argv = require('minimist')(process.argv.slice(2));

    if (argv.task) {
      console.log('Welcome to console!');

      if (fs.existsSync(options.tasksPath + argv.task + '.js')) {
        console.log('Executing "' + argv.task + '":');

        require(options.tasksPath + argv.task)(app, argv);

        return true;
      } else {
        console.log('Task "' + argv.task + '" not found');

        return process.exit(0);
      }
    }

    return false;
  }

  return cls;
}

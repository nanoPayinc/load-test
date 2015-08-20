'use strict';

var fs = require('fs');

module.exports = function() {
  class BaseModulePlugin {
    constructor (moduleName) {
      this.eventList = this.loadEvents();

      var errorsFilePaths = './modules/' + moduleName + '/errors/data.json';

      if (fs.existsSync(errorsFilePaths)) {
        this.errors = JSON.parse(fs.readFileSync(errorsFilePaths, "utf8"));
      } else {
        this.errors = {};
      }
    }

    loadEvents () {
    }

    afterBoot () {}
  }

  return BaseModulePlugin;
};

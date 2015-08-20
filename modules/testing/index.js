'use strict';

module.exports = function(app, moduleName) {
  class ModuleClass extends app.BaseModuleClass {
    constructor() {
      super(moduleName);
    }
  }

  return new ModuleClass();
};

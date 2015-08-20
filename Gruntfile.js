'use strict';

var dirname = (new Date()).toISOString();

module.exports = function(grunt){
  var branch = grunt.option('branch');
  var config = grunt.option('config');

  var logpath = '/pkg/stack/logs/api/';
  var apppath = '/pkg/stack/api/';
  var node_env = config;

/*
  if (config === 'staging') {
    logpath  = '/pkg/stack/logs/api/';
    apppath  = '/pkg/stack/api/';
    node_env = 'staging';
  } else if (config === 'ct') {
    logpath  = '/pkg/stack/logs/api.ct/';
    apppath  = '/pkg/stack/api.ct/';
    node_env = 'ct';
  } else if (config === 'demo') {
    logpath  = '/pkg/stack/logs/api/';
    apppath  = '/pkg/stack/api/';
    node_env = 'demo';
  }
  */

  grunt.initConfig({
    deploydev: {
      apinode1:'apidev1',
      apinode2:'apidev2'
    },
    deployprod: {
      apinode1:'api1',
      apinode2:'api2'
    },
    shell: {
      saveBranch: {
        command: 'git rev-parse --symbolic-full-name --abbrev-ref HEAD >> branch'
      }
    },
    // our shared sshconfig
    jshint: {
      all: {
        src: ['modules/{,*/}{,*/}{,*/}{,*/}*.js', 'server/{,*/}{,*/}{,*/}{,*/}*.js']
      },
      options: {
        jshintrc: true
      }
    },
    jshintrc: true,
    sshconfig: {
      cluster: {
        host: '10.147.27.30',
        port: 10022,
        username: process.env.STAGEUSER,
        path: '/pkg/stack/api',
        agent: process.env.SSH_AUTH_SOCK,
        agentForward: true,
        ignoreErrors: true
      },
      devcluster: {
        host: '10.147.27.20',
        port: 10022,
        username: process.env.STAGEUSER,
        path: '/pkg/stack/api',
        agent: process.env.SSH_AUTH_SOCK,
        agentForward: true,
        ignoreErrors: true
      },
      demo: {
        host: "67.213.68.45",
        port: 55022,
        username: process.env.STAGEUSER,
        path: "/pkg/stack/api",
        agent: process.env.SSH_AUTH_SOCK,
        agentForward: true
      },
      ct: {
        host: "67.213.68.44",
        port: 55022,
        username: process.env.STAGEUSER,
        path: "/pkg/stack/ct",
        agent: process.env.SSH_AUTH_SOCK,
        agentForward: true
      }
    },
    // define our ssh commands
    sshexec: {
      'start': {
        command: 'cd ' + apppath + 'current &&  NODE_ENV=' + node_env + ' forever start -c "node --es_staging"  --uid "node-' + config + '" --pidFile "/var/run/forever/forever-api.pid" -l ' + logpath + 'forever.log -o ' + logpath + 'forever.out -e ' + logpath + 'forever.err --append .'
      },
      'restart': {
        command: 'cd ' + apppath + 'current &&  NODE_ENV=' + node_env + ' forever restart "node-' + config + '"  -c "node --es_staging" '
      },
      'stop': {
        command: 'cd ' + apppath + 'current &&  NODE_ENV=' + node_env + ' forever  stop "node-' + config + '" -c "node --es_staging" '
      },
      'reset-database': {
        command: 'cd ' + apppath + 'current &&  NODE_ENV=' + node_env + ' iojs --es_staging . --task resetDatabase'
      },
      'make-release-dir': {
        command: 'mkdir -m 775 -p ' + apppath + 'releases/' + dirname
      },
      'update-symlinks': {
        command: 'rm -rf ' + apppath + 'current && ln -s ' + apppath + 'releases/' + dirname + ' ' + apppath + 'current'
      },
      'npm-install': {
        command: 'cd ' + apppath + 'releases/' + dirname + ' && npm install --production'
      },
      'set-config': {
        command: 'mv -f ' + apppath + 'current/config/<%= grunt.option(\'config\') %>.yml ' + apppath + 'current/config/default.yml'
      },
      'git-pull': {
        command: 'cd ' + apppath + 'releases/' + dirname + ' && git clone -b ' + branch + ' git@github.com:nanoPayinc/api.git .'
      },
      'prune': {
        command: 'cd ' + apppath + 'releases && rm -rf $(ls -1tr | head -n -5)'
      },


      //
      // Cluster deploy
      //


      // apidev1
      'disable-apidev1': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "disable server apidev/apidev1"'
      },
      'rsync-apidev1': {
        command: 'rsync --rsh="ssh -oPort=10022" -avO --delete /pkg/stack/api/ 10.147.27.21:/pkg/stack/api/'
      },
      'stop-loopback-apidev1': {
        command: 'ssh -p 10022 10.147.27.21 forever stop "node-' + config + '"'
      },
      'start-loopback-apidev1': {
        command: 'ssh -p 10022 10.147.27.21 "cd /pkg/stack/api/current && NODE_ENV=devcluster forever start -c "node --es_staging" --uid "node-' + config + '" --pidFile "/var/run/forever/forever-api.pid" --append -o /pkg/stack/logs/api/forever.out -e /pkg/stack/logs/api/forever.err -l /pkg/stack/logs/api/forever.log ."'
      },
      'enable-apidev1': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "enable server apidev/apidev1"'
      },

      // apidev2
      'disable-apidev2': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "disable server apidev/apidev2"'
      },
      'rsync-apidev2': {
        command: 'rsync --rsh="ssh -oPort=10022" -avO --delete /pkg/stack/api/ 10.147.27.22:/pkg/stack/api/'
      },
      'stop-loopback-apidev2': {
        command: 'ssh -p 10022 10.147.27.22 forever stop "node-' + config + '"'
      },
      'start-loopback-apidev2': {
        command: 'ssh -p 10022 10.147.27.22 "cd /pkg/stack/api/current && NODE_ENV=devcluster forever start -c "node --es_staging" --uid "node-' + config + '" --pidFile "/var/run/forever/forever-api.pid" --append -o /pkg/stack/logs/api/forever.out -e /pkg/stack/logs/api/forever.err -l /pkg/stack/logs/api/forever.log ."'
      },
      'enable-apidev2': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "enable server apidev/apidev2"'
      },
      
      
      // api1
      'disable-api1': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "disable server api/api1"'
      },
      'rsync-api1': {
        command: 'rsync --rsh="ssh -oPort=10022" -avO --delete /pkg/stack/api/ 10.147.27.31:/pkg/stack/api/'
      },
      'stop-loopback-api1': {
        command: 'ssh -p 10022 10.147.27.31 forever stop "node-' + config + '"'
      },
      'start-loopback-api1': {
        command: 'ssh -p 10022 10.147.27.31 "cd /pkg/stack/api/current && NODE_ENV=cluster forever start -c "node --es_staging" --uid "node-' + config + '" --pidFile "/var/run/forever/forever-api.pid" --append -o /pkg/stack/logs/api/forever.out -e /pkg/stack/logs/api/forever.err -l /pkg/stack/logs/api/forever.log ."'
      },
      'enable-api1': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "enable server api/api1"'
      },

      // api2
      'disable-api2': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "disable server api/api2"'
      },
      'rsync-api2': {
        command: 'rsync --rsh="ssh -oPort=10022" -avO --delete /pkg/stack/api/ 10.147.27.32:/pkg/stack/api/'
      },
      'stop-loopback-api2': {
        command: 'ssh -p 10022 10.147.27.32 forever stop "node-' + config + '"'
      },
      'start-loopback-api2': {
        command: 'ssh -p 10022 10.147.27.32 "cd /pkg/stack/api/current && NODE_ENV=cluster forever start -c "node --es_staging" --uid "node-' + config + '" --pidFile "/var/run/forever/forever-api.pid" --append -o /pkg/stack/logs/api/forever.out -e /pkg/stack/logs/api/forever.err -l /pkg/stack/logs/api/forever.log ."'
      },
      'enable-api2': {
        command: 'ssh -p 10022 10.147.27.10 haproxyctl "enable server api/api2"'
      },
    },
  });

  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-contrib-jshint');

  grunt.registerTask('deploy', [
    'sshexec:make-release-dir',
    'sshexec:prune',
    'sshexec:update-symlinks',
    'sshexec:git-pull',
    'sshexec:npm-install',
    'sshexec:stop',
    'sshexec:start'
  ]);

  grunt.registerTask('stage', [
    'sshexec:make-release-dir',
    'sshexec:prune',
    'sshexec:git-pull',
    'sshexec:npm-install',
    'sshexec:update-symlinks',
    'sshexec:stop',
    'sshexec:start',
    //'sshexec:restart-loopback'
//    'sshexec:set-config',
  ]);


  grunt.task.registerMultiTask('deploydev', 'Deploy to dev cluster', function() {
    grunt.task.run([
    'sshexec:disable-' + this.data,
    'sshexec:rsync-' + this.data,
    'sshexec:stop-loopback-' + this.data,
    'sshexec:start-loopback-' + this.data,
    'sshexec:enable-' + this.data,
    ]);
  });
  
  grunt.task.registerMultiTask('deployprod', 'Deploy to production cluster', function() {
    grunt.task.run([
    'sshexec:disable-' + this.data,
    'sshexec:rsync-' + this.data,
    'sshexec:stop-loopback-' + this.data,
    'sshexec:start-loopback-' + this.data,
    'sshexec:enable-' + this.data,
    ]);
  });

  grunt.registerTask('node-start', [
    'sshexec:start'
  ]);

  grunt.registerTask('node-stop', [
    'sshexec:stop'
  ]);

  grunt.registerTask('reset-database', [
    'sshexec:reset-database'
  ]);

  grunt.registerTask('node-restart', [
    'sshexec:restart'
  ]);
};


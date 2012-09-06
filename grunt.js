/*global module:false*/
module.exports = function(grunt) {

  grunt.loadNpmTasks('grunt-rigger');
  grunt.loadNpmTasks('grunt-jasmine-runner');

  // Project configuration.
  grunt.initConfig({
    meta: {
      version: '0.2.0',
      banner: '// Backbone.Marionette.Async, v<%= meta.version %>\n' +
        '// Copyright (c)<%= grunt.template.today("yyyy") %> Derick Bailey, Muted Solutions, LLC.\n' + 
        '// Distributed under MIT license\n' + 
        '// http://github.com/derickbailey/backbone.marionette.async'
    },

    lint: {
      files: ['src/async.js', 'src/backbone.marionette.async.*.js']
    },

    rig: {
      async: {
        src: ['<banner:meta.banner>', 'src/async.js'],
        dest: 'lib/backbone.marionette.async.js'
      },
      amd: {
        src: ['<banner:meta.banner>', 'src/amd.js'],
        dest: 'lib/amd/backbone.marionette.async.js'
      },
    },

    min: {
      async: {
        src: ['<banner:meta.banner>', '<config:rig.async.dest>'],
        dest: 'lib/backbone.marionette.async.min.js'
      },
      amd: {
        src: ['<banner:meta.banner>', '<config:rig.amd.dest>'],
        dest: 'lib/amd/backbone.marionette.async.min.js'
      }
    },

    jasmine : {
      src : [
        'public/javascripts/jquery.js',
        'public/javascripts/json2.js',
        'public/javascripts/underscore.js',
        'public/javascripts/backbone.js',
        'public/javascripts/backbone.marionette.js',
        'src/async.js',
        'spec/javascripts/support/*.js',
        'src/backbone.marionette.async.*.js',
        'src/async.init.js'
      ],
      helpers : 'spec/javascripts/helpers/*.js',
      specs : 'spec/javascripts/**/*.spec.js'
    },

    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: false,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        browser: true
      },
      globals: {
        jQuery: true,
        Backbone: true,
        _: true,
        Async: true,
        $: true,
        Marionette: true,
        callDeferredMethod: true
      }
    },
    uglify: {}
  });

  // Default task.
  grunt.registerTask('default', 'rig lint min');

};

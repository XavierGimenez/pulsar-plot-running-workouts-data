module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    copy: {
      main: {
        src: ['*', 'css/*', 'data/*', 'image/*','!**/bower_components/**', '!bower.json', '!main.js', '!workouts-chart.js', '!Gruntfile.js', '!**/node_modules/**', '!package.json'],
        expand: true,
        cwd: '.',
        dest: 'dist/',
      },
    },
    bowercopy: 
    {
      options: {
        srcPrefix: 'bower_components'
      },
      scripts: {
        options: {
          destPrefix: 'dist/bower_components'
        },
        files: {
          'd3/d3.min.js': 'd3/d3.min.js',
          'lodash/lodash.min.js' : 'lodash/lodash.min.js',
          'Processing.js/processing.min.js' : 'Processing.js/processing.min.js',
          'queue-async/queue.min.js' : 'queue-async/queue.min.js',
          'turf/turf.min.js' : 'turf/turf.min.js',
          'stats.js/build/stats.min.js' : 'stats.js/build/stats.min.js',
          'requirejs/require.js' : 'requirejs/require.js'
        }
      }
    },
    concat: {
      js: {
        src: ['main.js', 'workouts-chart.js'],
        dest: 'dist/main.js'

      }
    },
    uglify: {
      options: {
        banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
      },
      js: {
        src: ['dist/main.js'],
        dest: 'dist/main.js'
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-bowercopy');

  // Default task(s).
  grunt.registerTask('default', ['copy','bowercopy', 'concat', 'uglify']);



};
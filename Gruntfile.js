module.exports = function(grunt) {

  var config = {
    copy: {
      src: {
        files: [{
          expand: true,
          src: [
            'node_modules/socket.io/**/*',
            '*.html',
            'js/*.js',
            'css/*.css',
            'package.json',
            '.gitignore',
            'server.js'
          ],
          dest: 'dist/'
        }]
      }
    },
  useminPrepare: {
      html: '*.html'
  },
  usemin: {
    html: 'dist/*.html'
  },
  uglify: {
    options :  {
      mangle :  false
    }
  },
  cssmin: {
      after: {
        files: {
          'dist/css/styles.css': ['dist/css/styles.css', 'dist/css/main.css']
        }
      }
    },
  uncss: {
    options: {
      ignoreSheets : ['css/main.css']
    },
    dist: {
      files: {
        'dist/css/styles.css': ['index.html', 'about.html', '500.html', '404.html']
      }
    }
  },
  htmlmin: {
        dist: {
          options: {
            removeComments: true,
            collapseWhitespace: true
          },
          files: {
            'dist/index.html': 'dist/index.html',
            'dist/404.html': 'dist/404.html',
            'dist/500.html': 'dist/500.html',
            'dist/about.html': 'dist/about.html'
          }
      }
  }
};

  grunt.initConfig(config);

  // Load all Grunt tasks
  require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);
  grunt.registerTask('default', ['copy', 'useminPrepare', 'concat', 'uglify', 'usemin', 'htmlmin', 'uncss', 'cssmin:after']);
};

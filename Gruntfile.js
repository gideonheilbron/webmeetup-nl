module.exports = function(grunt){
  'use strict';

  // Load time of Grunt does not slow down even if there are many plugins
  require('jit-grunt')(grunt);

  // Measures the time each task takes
  require('time-grunt')(grunt);

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    notify: {
      watch: {
        options: {
          title: 'Watch',
          message: 'Grunt noticed a filechange',
        }
      },
      sass: {
        options: {
          title: 'Build',
          message: 'Grunt build complete',
        }
      },
      assets: {
        options: {
          title: 'Assets',
          message: 'Assets build complete'
        }
      }
    },

    sass: {
      main: {
        options: {
          style: 'expanded',
          trace: true
        },
        files: {
          'css/application.css': [
            'scss/application.scss'
          ]
        }
      },
    },

    postcss: {
      options: {
        map: true,
        processors: [
          require('autoprefixer')({
            browsers: ['last 2 versions']
          })
        ]
      },
      files: {
        'css/application.css': [
          'css/application.css'
        ]
      }
    },

    cssmin: {
      build: {
        src: 'css/application.css',
        dest: 'css/application.css'
      }
    },

    watch: {
      js: {
        files: ['js/**/*.js'],
        tasks: ['concat']
      },
      sass: {
        files: ['scss/**/*.scss'],
        tasks: ['sass'],
        options: {
          livereload: true,
          sourcemap: true
        }
      },
    },

    concat: {
      dev: {
        src: [
          'js/source/*.js'
        ],
        dest: 'js/build/application.js'
      },
      assets: {
        src: [
          'js/source/assets/*.js'
        ],
        dest: 'js/build/assets.js'
      }
    },

    bower_concat: {
      all: {
        dest: 'js/build/assets.js'
      }
    },

    clean: ['js/build/application.js', 'css/application.css'],

    uglify: {
      build: {
        files: {
          'js/build/application.js': ['js/build/application.js']
        }
      },
      assets: {
        files: {
          'js/build/assets.js': ['js/build/assets.js']
        }
      }
    }

  });

  grunt.registerTask('default',
    ['build', 'notify:sass']
  );
  grunt.registerTask('build',
    ['newer:sass', 'concat', 'newer:postcss']
  );
  grunt.registerTask('assets',
    ['bower_concat', 'concat:assets', 'uglify:assets', 'notify:assets']
  );
  grunt.registerTask('production',
    ['build', 'cssmin', 'bower_concat', 'uglify']
  );

};

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
        tasks: ['concat', 'notify:watch']
      },
      sass: {
        files: ['scss/**/*.scss'],
        tasks: ['sass', 'notify:watch'],
        options: {
          livereload: true,
          sourcemap: true
        }
      },
    },

    grunticon: {
      icons: {
        files: [{
          expand: true,
          cwd: 'icons',
          src: ['*.svg', '*.png'],
          dest: 'images/generated'
        }],
        options: {
          template: 'icons/icon-template.hbs',
          cssprefix: '.i-',
          previewhtml: false, // IGNORE THE ERROR THIS LINE THROWS! We don't want an example file and Grunticon doesn't provide a way to disable this output. Grunticon runs fine even while it gives an error :)
          datasvgcss: '../../scss/generated/icons-svg.scss',
          datapngcss: '../../scss/generated/icons-png.scss',
          urlpngcss: '../../scss/generated/icons-fallback.scss',
          loadersnippet: '../../js/generated/grunticon.loader.js',
          pngfolder: '/',
          pngpath: '/',
          enhanceSVG: true
        }
      }
    },

    concat: {
      dev: {
        src: [
          'js/application.js',
          'js/classes/*.js'
        ],
        dest: 'js/build/application.js'
      },
      assets: {
        src: [
          'js/assets/*.js'
        ],
        dest: 'js/generated/assets.js'
      }
    },

    bower_concat: {
      all: {
        dest: 'js/generated/bower_assets.js'
      }
    },

    clean: ['js/build/application.js', 'css/application.css'],

    uglify: {
      build: {
        files: {
          'js/build/application.js': ['js/application.js']
        }
      },
      assets: {
        files: {
          'js/build/assets.js': ['js/generated/bower_assets.js', 'js/generated/assets.js']
        }
      }
    }

  });

  grunt.registerTask('default',
    ['build', 'notify:sass']
  );
  grunt.registerTask('build',
    ['images', 'newer:sass', 'concat', 'newer:postcss']
  );
  grunt.registerTask('images',
    ['grunticon:icons']
  );
  grunt.registerTask('assets',
    ['bower_concat', 'concat:assets', 'uglify:assets','notify:assets']
  );
  grunt.registerTask('production',
    ['build', 'cssmin', 'bower_concat', 'uglify:assets', 'uglify']
  );

};

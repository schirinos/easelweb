module.exports = function(grunt) {

    // Project configuration
    grunt.initConfig({

        // Copy files
        copy: {
            main: {
                files: [
                    {expand: true, src: ['index.php', '.htaccess', 'config.php'], dest: 'dist/'},
                    {expand: true, src: ['lib/**'], dest: 'dist/'},
                    {expand: true, src: ['assets/bootstrap/**', 'assets/jquery/**'], dest: 'dist/'},
                    {expand: true, src: ['assets/easelweb/css/**'], dest: 'dist/'},
                    {expand: true, flatten: true, src: ['assets/init.js'], dest: 'dist/assets/easelweb/js/'},
                ]
            }
        },


        // Combine and Minify css
        cssmin: {
            combine: {
                files: {
                    'dist/assets/easelweb/css/easelweb.css': ['assets/codemirror/css/codemirror.css', 'assets/etch/css/etch.css', 'assets/easelweb/css/easelweb.css']
                }
            }
        },

        // Optimize javascript files
        requirejs: {
            compile: {
                options: {
                    baseUrl: "assets/",
                    name: "require/almond",
                    include: ["main"],
                    out: "dist/assets/easelweb/js/easelweb.js",
                    wrap: true,
                    mainConfigFile: "assets/main.js"
                }
            }
        }

    });

    // Load tasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-concat-css');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-requirejs');

    // Register task
    grunt.registerTask('default', ['copy', 'cssmin', 'requirejs']);
};
module.exports = function (grunt) {
    grunt.initConfig({
        mochaTest: {
            test: {
                options: {
                    reporter: 'spec',
                    quiet: false,
                    clearRequireCache: false
                },
                src: ['test/**/*.js']
            }
        },
        jison: {
            target : {
                files: {
                    'dist/parser.js': ['lib/parser.y', 'lib/lexer.l']
                }
            }
        }
    });
    grunt.loadNpmTasks('grunt-jison');
    grunt.loadNpmTasks('grunt-mocha-test');

    grunt.registerTask('default', ['jison']);
    grunt.registerTask('test', ['mochaTest']);
};

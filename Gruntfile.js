module.exports = function (grunt) {
    grunt.initConfig({
        jison: {
            target : {
                files: {
                    'dist/parser.js': ['src/parser.y', 'src/lexer.l']
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-jison');

    grunt.registerTask('default', ['jison']);
};

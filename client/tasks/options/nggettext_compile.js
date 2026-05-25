module.exports = {
    all: {
        files: {
            '<%= distDir %>/locale.generated.js': '<%= poDir %>/*.po'
        }
    }
};

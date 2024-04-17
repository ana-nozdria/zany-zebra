const handlebars = require('handlebars');

handlebars.registerHelper('isEqual', function (value1, value2, options) {
    if (value1 === value2) {
        return options.fn(this);
    }
});

module.exports = {
    isEqual: handlebars.helpers.isEqual,
};
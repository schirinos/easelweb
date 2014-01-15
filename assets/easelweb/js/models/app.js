/**
    Easelweb App Model - 
 */
define([
    'backbonePkg',
],
function (Backbone) {
    // Easelweb state model
    var exports = Backbone.Model.extend({
        /**
         * The widget removals to process server side
         * @type {object}
         */
        removals: {}
    });

    // Export module
    return exports;
});
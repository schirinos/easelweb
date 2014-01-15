/**
    Easelweb Base View - 
 */
define([
    'backbonePkg',
],
function (Backbone) {
    var exports = Backbone.View.extend({
        /**
         * Attach template to the view
         */
        attachTemplate: function () {
            // Create new dom element, and insert the template as innerhtml
            var new_elem = document.createElement('div');
            new_elem.innerHTML = this.template();
            
            // Extract the first child of the dom element and use it as the view's new root element
            this.setElement(new_elem.firstChild);

            // Cache data-bind marked elements as jQuery objects
            this.cacheBindRegions();

            // Clean up wrapper element
            new_elem = undefined;
        },
        /**
         * Create cached jQuery objects from all "data-bind" tags to use later.
         */
        cacheBindRegions: function () {
            // For callbacks
            var self = this;

            // Iterate through the "data-bind" tags
            this.$('[data-bind]').each(function (idx, elem) {
                // Cache a copy of the jquery object for that element
                self["$"+$(this).data("bind")] = $(this);
                
                // Attach the more precise selector, since it is lost by rewrapping element directly in jquery function ie: $(this)
                self["$"+$(this).data("bind")].selector = this.tagName.toLowerCase() + '[data-bind="' + $(this).data("bind") + '"]';
            });
        },
        /**
         * Render
         * @param {object} selector The element selector to render the toolbar into. Almost always should be the body.
         */
        render: function (selector) {
            $(selector).append(this.el);
        }
    });

    // Export module
    return exports;
});
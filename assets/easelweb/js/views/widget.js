/**
    Easelweb Widget View - 
 */
define([
    'easelweb/vent',
    'easelweb/views/base',
    'etch',
    'easelweb/cookies'
],
function (Vent, BaseView, etch, Cookies) {
    // Easelweb widget view
    var exports = BaseView.extend({
        /**
         * Attributes on the widget the we don't allow editing through the widget editor form.
         * @type {array}
         */
        blockedAttr: ['data-ew-widget', 'data-ew-uri', 'data-ew-init', 'contenteditable'],
        /**
         * Event bindings
         * @type {object}
         */
        events: {
            'click': 'initToolbar'
        },
        /**
         * Initialization
         * @param {object} options The view options
         */
        initialize: function(options) {
            // Store reference to app
            this.app = options.app;

            // Store reference to the view on its DOM node
            // This is used later to reference the widget view when you only can access the DOM node
            // NOTE: This will not work on <embed> <applet> and <object> (except flash) tags\
            this.$el.data('ew.widget', this);

            // Uses easelweb attributes on the root element
            // to generate a model schema.
            this.generateSchema();

            // Try running the initialization callback
            this.runInit();
        },
        /**
         * Disable all widget interaction to allow normal interaction with the html
         */
        disableWidget: function() {
            // Disable event bindings
            this.undelegateEvents();

            // Remove widget class
            this.$el.removeClass(this.app.config.widgetClass);

            // remove contenteditable attributes
            this.$el.find('[contenteditable]').removeAttr('contenteditable');
            this.$el.removeAttr('contenteditable');
        },
        /**
         * Enable widget interaction
         */
        enableWidget: function() {
            // Re-bind events
            this.delegateEvents();

            // Add widget class
            this.$el.addClass(this.app.config.widgetClass);
        },
        /**
         * Enable widget interaction
         */
        runInit: function() {
            // Check for a re-init function, only run in easelweb mode
            if (this.$el.attr('data-ew-init') && Cookies.hasItem('easelweb')) {
                if (_.isFunction(window[this.$el.attr('data-ew-init')])) {
                    // Run function in context of the widget's element
                    window[this.$el.attr('data-ew-init')].call(this.el);
                }
            }
        },
        /**
         * Store easelweb data attributes (data-ew) on the attached model.
         * Also generate schema for later use in form generation.
         */
        generateSchema: function() {
            // Make sure we have a model
            if (this.model) {
                
                var model_values = {};
                var model_schema = {};
                var model_bindings = {':el': {'attributes': []}};

                // For callbacks
                var self = this;

                // If this is an image add height width tags if not available
                if (this.el.tagName === 'IMG') {
                    if (!this.$el.attr('height')) {
                        this.$el.attr('height', this.$el.height());
                    }
                    if (!this.$el.attr('width')) {
                        this.$el.attr('width', this.$el.width());
                    }
                }

                // Iterate over element attributes, restrict certain ones
                $.each(this.el.attributes, function (i, attrib) {

                    // Map attribute name and values to the widget model
                    model_values[attrib.name] = attrib.value;

                    // Skip restricted attributes, for froms schema and stickit bindings
                    if (!_.contains(self.blockedAttr, attrib.name)) {
                        // Build stickit bindings for root element
                        model_bindings[':el']['attributes'].push({
                            'name': attrib.name,
                            'observe': attrib.name
                        }) ;

                        // Build Backbone.Forms schema definitions
                        // Different form field types based on the attribute
                        if (attrib.value === 'true' || attrib.value === 'false') {
                            model_schema[attrib.name] = {type:'Radio', options: ['true', 'false']};
                        } else {
                            model_schema[attrib.name] = {type:'Text'};
                        }

                        // Modify titles for 'data-ew' attributes
                        var is_ew_attr = attrib.name.match(/^data\-ew\-([a-z].*)/);
                        if (is_ew_attr) {
                            model_schema[attrib.name]['title'] = is_ew_attr[1].charAt(0).toUpperCase() + is_ew_attr[1].slice(1);
                        }
                    }
                });

                // Set model schema, used for Backbone Forms generation
                this.model.schema = model_schema;

                // Clear previous values and set new model values
                this.model.clear({silent:true});
                this.model.set(model_values);

                // Set stickit bindings
                this.bindings = model_bindings;

                // Bind stickit
                this.stickit();
            }
        },
        /**
         * Replace the html of the widget with the html snippet specified. Includes the root element
         * @param {string} newHTML The html string that will replace the existing widget html
         */
        updateHTML: function(newHTML) {
            // Remove child widgets from application tracker, since we are updating HTML and will blow
            // away the original elements
            this.$(this.app.config.widgetSelector).each(function (idx, elem) {
                // Check to see if the element has a widget attach to it
                // because if it doesn't that means there is nothing to remove in the tracker.
                // This happens because nested widgets are removed by the widgets they are contained in
                if ($(elem).data('ew.widget')) {
                    $(elem).data('ew.widget').destroy();
                }
            });

            // Create new element, base on the HTML string passed
            var $new_elem = $(newHTML);

            // Do whole replace of the widget html, including the root element
            this.$el.replaceWith($new_elem);

            // Move all event listeners to the new dom element
            this.setElement($new_elem[0]);

            // Re-generate schema
            // in case there are any new attributes added
            this.generateSchema();

            // Re run the initialization callback
            this.runInit();

            // Re-Initialize any child widgets within this widget
            this.$(this.app.config.widgetSelector).each(function (idx, elem) {
                Vent.trigger('app:initWidget', elem);
            });
        },
        /**
         * Show the widget toolbar
         * @param {object} e Event object
         */
        initToolbar: function (e) {
            // Prevents things link links from activating
            // while in widget mode
            e.preventDefault();

            etch.editableInit(e, this);
        },
        /**
         * Destroy the widget, removing it from the dom and from the application widget tracker.
         * Will also remove any child widgets it finds.
         * @param {object} e Event object
         */
        destroy: function () {
            // Look for child widgets and remove them first
            this.$(this.app.config.widgetSelector).each(function (idx, elem) {
                if ($(elem).data('ew.widget')) {
                    $(elem).data('ew.widget').destroy();
                }
            });

            // Remove widget from tracker
            Vent.trigger('app:removeWidget', this);

            // Remove from dom
            this.remove();
        }
    });

    // Export module
    return exports;
});
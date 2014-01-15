/*
 * Easelweb 3.0
 * A library that provides inline editing for a webpage based on custom tags in the html.
 * A companion server side script is used to save the changes. 
 * Uses etch.js as a basis for inline editing using contenteditable.
 * Also uses codemirror for code editing.
 *
 * Copyright 2013 Sigfrido Chirnos
 * http://easelweb.com
 *
 */
/**
    Easelweb Base View
 */
define([
    'backbonePkg',
    'easelweb/vent',
    'etch',
    'easelweb/views/toolbar',
    'easelweb/views/widget',
    'easelweb/models/widget'
],
function (Backbone, Vent, etch, ToolbarView, WidgetView, WidgetModel) {
    // Setup application namespace
    var app = {};

    // Arrays to track widgets, and regions
    app.widgets = [];
    app.regions = [];

    // Default application configuration
    app.config = {
        // Selector used to find easelweb widgets and regions
        selector: '[data-ew-widget]',
        regionSelector: '[data-ew-uri]',

        // Activated widget class
        widgetClass: 'easelweb-widget',

        // Urls
        saveUrl: '../save/',
        publishUrl: '../publish/',
        uploadUrl: '../upload/',
        logoutUrl: '../logout/',

        // Selectors of elements to remove before submiting regions to server
        removals: ['.easelweb-toolbar', '.easelweb-widget-toolbar'],

        // Etch toolbar types
        buttonClasses: {
            'html': ['settings','bold', 'italic', 'underline', 'unordered-list', 'ordered-list', 'link', 'clear-formatting'],
            'image': ['image'],
            'widget': ['settings', 'new', 'remove']
        }
    };

    /**
     * Initialize the easelweb interface
     * @param {object} config Configuration settings for easelweb
     */
    app.init = function (config) {
        // Merge config
        if (config) {
            app.config = _.extend({}, app.config, config);
        }

        // Pass configuration to etch
        etch.setConfig(app.config);

        // Create toolbar model
        var toolbar_model = new Backbone.Model();
        toolbar_model.urlRoot = app.config.saveUrl;

        // Create toolbar view and render to the body
        app.toolbar = new ToolbarView({model: toolbar_model, app: app});
        app.toolbar.render('body');

        // Track the dom elements marked as regions (data-ew-uri)
        // We use the uri info later to update back on the server.
        $(app.config.regionSelector).each(function (idx, elem) {
            app.regions.push(elem);
        });

        // Initialize easelweb widgets
        $(app.config.selector).each(function (idx, elem) {
            app.initWidget(elem);
        });

        // Disable the widget event listeners
        // we will enabled them later when the user clicks open the toolbar.
        _.each(app.widgets, function (widget, key, list) {
            widget.view.undelegateEvents();
        });

        // Listen for messages
        Vent.on('app:removeWidget', app.removeWidget);
        Vent.on('app:initWidget', app.initWidget);
    };

    /**
     * Initialize an easelweb widget
     * @param {object} config Configuration settings for easelweb
     * @param {boolean} hasChildren Whether to try and initialize child widgets within this widget
     */
    app.initWidget = function (elem, hasChildren) {
        // Add the class signifying it is a widget
        $(elem).addClass(app.config.widgetClass);

        // Create the widget view
        var view = new WidgetView({el: elem, model: new WidgetModel(), app: app});

        // Attach id of view to the DOM element of the view.
        // This is used later to know which view a dom element belongs to.
        // NOTE: This will not work on <embed> <applet> and <object> (except flash) tags
        view.$el.data('cid', view.cid);

        // Store widget view in registry
        app.widgets.push({view: view, id: view.cid});

        // Look for child widgets
        if (hasChildren) {
            view.$(app.config.selector).each(function (idx, elem) {
                app.initWidget(elem);
            });
        }
    };

    /**
     * Disable all widgets on the page
     */
    app.disableWidgets = function () {
        _.each(app.widgets, function (widget, key, list) {
            widget.view.disableWidget();
        });
    };

    /**
     * Enable all widgets on the page
     */
    app.enableWidgets = function () {
        _.each(app.widgets, function (widget, key, list) {
            widget.view.enableWidget();
        });
    };

    /**
     * Remove the widget
     * @param {object} widget The widget to remove
     */
    app.removeWidget = function (widget) {
        // Remove from dom
        widget.remove();

        // Remove from tracking array
        app.widgets = _.reject(app.widgets, function (item) {
            return widget.cid === item.id;
        });
    };

    /**
     * Remove a widget using its client id
     * @param {string} cid The client id of the widget to remove
     */
    app.removeWidgetById = function (cid) {
        // Find the widget in the application's widgets array
        var widget = _.find(app.widgets, function (item) {
            return item.id === cid;
        });

        if (widget) {
            app.removeWidget(widget);
        }
    };

    /**
     * Remove easelweb interface
     */
    app.destroy = function () {
        // Remove easelweb toolbar
        app.toolbar.remove();

        // Temporarily remove events
        _.each(app.widgets, function (view, key, list) {
            view.undelegateEvents();
        });

        // Remove the editable class from all elements
        $('.'+app.config.widgetClass).removeClass('on');
        $('.'+app.config.widgetClass).removeClass(app.config.widgetClass);
    };

    // Export module
    return app;
});
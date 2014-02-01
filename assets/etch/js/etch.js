/**
    Etch.js
 */
define([
    'backbonePkg',
    'easelweb/vent'
],
function (Backbone, Vent) {
    // Instantiate variables
    var models = {},
        views = {},
        collections = {},
        etch = {};
    
    // versioning as per semver.org
    etch.VERSION = '0.6.2';

    // Default config
    etch.config = {
        // selector to specify editable elements   
        selector: '.editable',
            
        // Named sets of buttons to be specified on the editable element
        // in the markup as "data-button-class"   
        buttonClasses: {
            'default': ['settings']
        }
    };

    // The editor model stores the state of the editor.
    // The editor view binds to this model and listen for state changes to update the view
    models.Editor = Backbone.Model;

    // Set the view for the editor
    views.Editor = Backbone.View.extend({
        /**
         * Event bindings
         * @type {object} 
         */
        events: {
            'click .etch-remove': 'actionRemove',
            'click .etch-new': 'actionNew',
            'click .etch-settings': 'showSettings',
            'click .etch-bold': 'toggleBold',
            'click .etch-italic': 'toggleItalic',
            'click .etch-underline': 'toggleUnderline',
            'click .etch-heading': 'toggleHeading',
            'click .etch-unordered-list': 'toggleUnorderedList',
            'click .etch-justify-left': 'justifyLeft',
            'click .etch-justify-center': 'justifyCenter',
            'click .etch-justify-right': 'justifyRight',
            'click .etch-ordered-list': 'toggleOrderedList',
            'click .etch-link': 'toggleLink',
            'click .etch-image': 'showSettings',
            'click .etch-save': 'save',
            'click .etch-clear-formatting': 'clearFormatting'
        },
        /**
         * Init stuff
         * @param {object} options View options
         */
        initialize: function() {
            // Model attribute event listeners:
            _.bindAll(this, 'changeButtons', 'changePosition', 'changeEditable', 'insertImage');

            this.listenTo(this.model, 'change:buttons', this.changeButtons);
            this.listenTo(this.model, 'change:position', this.changePosition);
            this.listenTo(this.model, 'change:editable', this.changeEditable);

            // Init Routines:
            this.changeEditable();
        },
        /**
         * Handles new action.
         * @param {object} e Event object
         */
        actionNew: function (e) {
            e.preventDefault();

            // Get the current widget
            var widget = this.model.get('widget');

            // Clone the DOM element
            var $cloned_elem = $(widget.el).clone();

            // Insert element after the original
            widget.$el.after($cloned_elem);

            // Clones can always be removed and duplicated
            $cloned_elem.attr('data-ew-removeable', 'true');
            $cloned_elem.attr('data-ew-new', 'true');

            // Init the element as an easelweb widget
            // pass true to init child widgets within the widget
            Vent.trigger('app:initWidget', $cloned_elem[0], true);
        },
        /**
         * Handles remove action.
         * @param {object} e Event object
         */
        actionRemove: function (e) {
            e.preventDefault();

            // Get the current widget
            var widget = this.model.get('widget');
           
            // Destroy widget
            widget.destroy();

            // Remove widget from tracker
            Vent.trigger('app:removeWidget', widget);
        },
        /**
         * Switches the editor to a different editable region
         */
        changeEditable: function() {
            // Set the buttons toolbar
            this.setButtonClass();
        },
        /**
         * Set the button toolbar set to use
         */
        setButtonClass: function() {
            // check the button class of the element being edited and set the associated buttons on the model
            var editorModel = this.model;
            var $editable = editorModel.get('editable');
            var tagName = $editable.prop('tagName');

            var buttonClass = $editable.attr('data-ew-widget') || 'widget';
            
            editorModel.set({ buttons: etch.config.buttonClasses[buttonClass] });
        },
        /**
         * Refresh the buttons in the editor panel
         */
        changeButtons: function() {
            // render the buttons into the editor-panel
            this.$el.empty();
            var view = this;
            var buttons = this.model.get('buttons');

            // Get the current widget
            var widget = this.model.get('widget');

            // Remove certain buttons
            var hasRemove = widget.$el.attr('data-ew-removeable') === 'true' ? true : false;
            var hasNew = widget.$el.attr('data-ew-new') === 'true' ? true : false;
            buttons = _.reject(buttons, function (item) {
                if (item === 'remove' && !hasRemove) {
                    return true;
                }

                if (item === 'new' && !hasNew) {
                    return true;
                }
            });
                        
            // hide editor panel if there are no buttons in it and exit early
            if (!buttons.length) { $(this.el).hide(); return; }
                        
            // Generate buttons from buttons array
            _.each(buttons, function(button){
                // Is this a easelweb button
                var $buttonEl;
                $buttonEl = $('<a href="#" class="btn btn-default etch-'+ button +'" title="'+ button +'"><span class="ewicon-'+button+'"></span></a>');

                // Add button to toolbar
                view.$el.append($buttonEl);
            });
                        
            $(this.el).show('fast');
        },
        /**
         * Re-position editor
         */
        changePosition: function() {
            // animate editor-panel to new position
            var pos = this.model.get('position');
            this.$el.animate({'top': pos.y, 'left': pos.x}, { queue: false });
        },
                
        wrapSelection: function(selectionOrRange, elString, cb) {
            // wrap current selection with elString tag
            var range = selectionOrRange === Range ? selectionOrRange : selectionOrRange.getRangeAt(0);
            var el = document.createElement(elString);
            range.surroundContents(el);
        },
                
        clearFormatting: function(e) {
            e.preventDefault();
            document.execCommand('removeFormat', false, null);
        },
            
        showSettings: function(e) {
            e.preventDefault();
            
            // Get the current widget
            var widget = this.model.get('widget');

            // Activate settings drawer
            Vent.trigger('toolbar:editwidget', widget);

            // Hide editor, unbind the listern that removes automatically
            $('.etch-editor-panel').remove();
            $(this).unbind('mousedown.editor');
        },

        toggleBold: function(e) {
            e.preventDefault();
            document.execCommand('bold', false, null);
        },

        toggleItalic: function(e) {
            e.preventDefault();
            document.execCommand('italic', false, null);
        },

        toggleUnderline: function(e) {
            e.preventDefault();
            document.execCommand('underline', false, null);
        },
                
        toggleHeading: function(e) {
            e.preventDefault();
            var range = window.getSelection().getRangeAt(0);
            var wrapper = range.commonAncestorContainer.parentElement
            if ($(wrapper).is('h3')) {
                $(wrapper).replaceWith(wrapper.textContent)
                return;
            }
            var h3 = document.createElement('h3');
            range.surroundContents(h3);
        },

        urlPrompt: function(callback) {
            // This uses the default browser UI prompt to get a url.
            // Override this function if you want to implement a custom UI.
                
            var url = prompt('Enter a url', 'http://');
                
            // Ensure a new link URL starts with http:// or https:// 
            // before it's added to the DOM.
            //
            // NOTE: This implementation will disallow relative URLs from being added
            // but will make it easier for users typing external URLs.
            if (/^((http|https)...)/.test(url)) {
                callback(url);
            } else {
                callback("http://" + url);
            }
        },
        
        toggleLink: function(e) {
            e.preventDefault();
            var range = window.getSelection().getRangeAt(0);

            // are we in an anchor element?
            if (range.startContainer.parentNode.tagName === 'A' || range.endContainer.parentNode.tagName === 'A') {
                // unlink anchor
                document.execCommand('unlink', false, null);
            } else {
                // promt for url and create link
                this.urlPrompt(function(url) {
                    document.execCommand('createLink', false, url);
                });
            }
        },

        toggleUnorderedList: function(e) {
            e.preventDefault();
            document.execCommand('insertUnorderedList', false, null);
        },

        toggleOrderedList: function(e){
            e.preventDefault();
            document.execCommand('insertOrderedList', false, null);
        },
                
        justifyLeft: function(e) {
            e.preventDefault();
            document.execCommand('justifyLeft', false, null);
        },

        justifyCenter: function(e) {
            e.preventDefault();
            document.execCommand('justifyCenter', false, null);
        },

        justifyRight: function(e) {
            e.preventDefault();
            document.execCommand('justifyRight', false, null);
        },

        getImage: function(e) {
            e.preventDefault();

            // call startUploader with callback to handle inserting it once it is uploded/cropped
            this.startUploader(this.insertImage);
        },
                
        startUploader: function(cb) {
            // initialize Image Uploader
            var model = new models.ImageUploader();
            var view = new views.ImageUploader({model: model});
                        
            // stash a reference to the callback to be called after image is uploaded
            model._imageCallback = function(image) {
                view.startCropper(image, cb);
            };


            // stash reference to saved range for inserting the image once its 
            this._savedRange = window.getSelection().getRangeAt(0);

            // insert uploader html into DOM
            $('body').append(view.render().el);
        },
                
        insertImage: function(image) {
            // insert image - passed as a callback to startUploader
            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(this._savedRange);
                        
            var attrs = {
                'editable': this.model.get('editable'),
                'editableModel': this.model.get('editableModel')
            };
                        
            _.extend(attrs, image);

            var model = new models.EditableImage(attrs);
            var view = new views.EditableImage({model: model});
            this._savedRange.insertNode($(view.render().el).addClass('etch-float-left')[0]);
        },
                
        save: function(e) {
            e.preventDefault();
            var editableModel = this.model.get('editableModel');
            editableModel.trigger('save');
        }
    });

    // Extend the base etch object with our custom models, views and collection
    // etc... as well as init function
    _.extend(etch, {
        models: models,
        views: views,
        collections: collections,

        /**
         * Set the etch configuration
         */
        setConfig: function (config) {
            _.extend(etch.config, config);
        },

        // This function is to be used as callback to whatever event
        // you use to initialize editing 
        editableInit: function(e, widget) {
            // Prevent bubbling
            e.stopPropagation();

            // Get clicked element and see if it is an editable area
            var target = e.target || e.srcElement;
            var $editable = $(target).etchFindEditable();

            // Only "html" types are editable directly
            if ($editable.attr('data-ew-widget') === 'html') {
                $editable.attr('contenteditable', true);
            }

            // if the editor isn't already built, build it
            var $editor = $('.etch-editor-panel');
            var editorModel = $editor.data('model');

            // Create new editor if not created?
            if (!$editor.size()) {
                // Build new editor panel
                $editor = $('<div class="etch-editor-panel">');
                var editorAttrs = { editable: $editable, editableModel: this.model, widget: widget };

                // Attach to the body
                document.body.appendChild($editor[0]);
                $editor.etchInstantiate({classType: 'Editor', attrs: editorAttrs});
                editorModel = $editor.data('model');

            // check if we are on a new editable
            } else if ($editable[0] !== editorModel.get('editable')[0]) {
                // set new editable
                editorModel.set({
                    editable: $editable,
                    editableModel: this.model,
                    widget: widget
                });
            }
            
            // Firefox seems to be only browser that defaults to `StyleWithCSS == true`
            // so we turn it off here. Plus a try..catch to avoid an error being thrown in IE8.
            try {
                document.execCommand('StyleWithCSS', false, false);
            }
            catch (err) {
                // expecting to just eat IE8 error, but if different error, rethrow
                if (err.message !== "Invalid argument.") {
                    throw err;
                }
            }

            // listen for mousedowns that are not coming from the editor
            // and close the editor
            $('body').bind('mousedown.editor', function(e) {
                // check to see if the click was in an etch tool
                var target = e.target || e.srcElement;
                if ($(target).not('.etch-editor-panel, .etch-editor-panel *, .etch-image-tools, .etch-image-tools *').size()) {
                    // remove editor
                    $editor.remove();
                                        
                    // once the editor is removed, remove the body binding for it
                    $(this).unbind('mousedown.editor');
                }
            });

            // Position editor panel
            // TODO: Account for top and bottom edges screen
            editorModel.set({position: {x: e.pageX - 15, y: e.pageY - 80}});
        }
    });

    // jquery helper functions
    $.fn.etchInstantiate = function(options, cb) {
        return this.each(function() {
            var $el = $(this);
            options || (options = {});

            var settings = {
                el: this,
                attrs: {}
            }

            _.extend(settings, options);

            var model = new models[settings.classType](settings.attrs, settings);

            // initialize a view is there is one
            if (_.isFunction(views[settings.classType])) {
                var view = new views[settings.classType]({model: model, el: this, tagName: this.tagName});
            }
                     
            // stash the model and view on the elements data object
            $el.data({model: model});
            $el.data({view: view});

            if (_.isFunction(cb)) {
                cb({model: model, view: view});
            }
        });
    };

    // Function that looks for the editable selector on itself or its parents
    // and returns that el when it is found
    $.fn.etchFindEditable = function() {
        var $el = $(this);
        return $el.is(etch.config.selector) ? $el : $el.closest(etch.config.selector);
    };

    // Export module
    return etch;
});
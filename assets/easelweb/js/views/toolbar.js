/**
    Easelweb Toolbar View - 
 */
define([
    'jquery',
    'easelweb/vent',
    'easelweb/views/base',
    'require/text!easelwebTpl/toolbar.html',
    'codemirrorPkg',
    'require/text!easelwebTpl/uploader.html'
],
function ($, Vent, BaseView, Tpl, CodeMirror, TplUploader) {
    // Easelweb toolbar
    var exports = BaseView.extend({
        /**
         * The HTML template for the view
         * @type {object}
         */
        template: _.template(Tpl),
        /**
         * Event bindings
         * @type {object}
         */
        events: {
            'click [data-action="toggle"]'          : 'actionToggle',
            'click [data-action="location"]'        : 'actionLocation',
            'click [data-action="save"]'            : 'actionSave',
            'click [data-action="publish"]'         : 'actionPublish',
            'click [data-action="hide"]'            : 'actionHide',
            'click [data-action="settings"]'        : 'actionSettings',
            'click [data-action="source"]'          : 'actionSource',
            'click [data-action="updateimage"]'     : 'actionUpdateImage',
            'click [data-action="cancelimage"]'     : 'actionCancelImage'
        },
        /**
         * Initialization
         * @param {object} options The view options
         */
        initialize: function(options) {
            // Attach the template
            this.attachTemplate();

            // Store reference to app
            this.app = options.app;

            // Set logout url
            this.$logout.attr('href', this.app.config.logoutUrl);

            // Listen for messages
            this.listenTo(Vent, 'toolbar:editwidget', this.initWidgetEditor);
        },
        /**
         * Handles save action.
         * @param {object} e Event object
         */
        actionSave: function (e) {
            e.preventDefault();

            // Call doSave to save all page data back to server
            this.doSave();
        },
        /**
         * Handles publish action.
         * @param {object} e Event object
         */
        actionPublish: function (e) {
            e.preventDefault();

            // For callbacks
            var self = this;

            // Save changes first
            var saving = this.doSave()

            // Only publish after successful save
            .done(function (){
                // Show status message
                self.showMessage('Publishing changes to live site...');

                // Call publish url
                var publishing = $.ajax(self.app.config.publishUrl, {
                    type: 'POST'
                })

                // Always execute
                .always(function () {
                    // Clear message
                    self.clearMessage();
                })

                // Success
                .done(function () {

                })

                // Error
                .fail(function () {

                });
            });
        },
        /**
         * Handles toggling of editing interface
         * @param {object} e Event object
         */
        actionToggle: function (e) {
            e.preventDefault();

            // Disable editing interface if active
            if (this.active) {
                // Hide toolbar and highlight of widgets
                this.$el.removeClass('open');
                $('body').removeClass('easelweb-active');

                // Disable widgets
                this.app.disableWidgets();

                // Set active flag for the easelweb interface
                this.active = false;
            } else {
                // Show toolbar and highlight of widgets
                this.$el.addClass('open');
                $('body').addClass('easelweb-active');

                // Enable widgets
                this.app.enableWidgets();

                // Set active flag for the easelweb interface
                this.active = true;
            }
        },
        /**
         * Handles update action. Takes changes from widget editor and updates the widget in the page.
         * @param {object} e Event object
         */
        actionHide: function (e) {
            e.preventDefault();

            // Cleanup editor and all tools
            this.hideTools(true);
        },
        /**
         * Handles settings action, showing the settings pane in the widget editor.
         * @param {object} e Event object
         */
        actionSettings: function (e) {
            e.preventDefault();

            // Show the widget editing pane.
            this.showWidgetEditor();
        },
        /**
         * Handles source action, showing the source pane in the widget editor.
         * @param {object} e Event object
         */
        actionSource: function (e) {
            e.preventDefault();

            // Show the source code editor pane.
            this.showSourceEditor();
        },
        /**
         * Handles update location action. Toggles toolbar between top and bottom.
         * @param {object} e Event object
         */
        actionLocation: function (e) {
            e.preventDefault();

            this.$el.toggleClass('bottom');
        },
        /**
         * Handles update image action.
         * @param {object} e Event object
         */
        actionUpdateImage: function (e) {
            e.preventDefault();

            // If we uploaded a file, then set the image widget to that file
            if (this.imageEditorUploaded && this.imageEditorWidget) {
                $(this.imageEditorWidget).attr('src', this.imageEditorUploaded.url);
            }
        },
        /**
         * Handles cancel image action.
         * @param {object} e Event object
         */
        actionCancelImage: function (e) {
            e.preventDefault();

            // Hide image editor
            this.hideTools(true);
        },
        /**
         * Save all easelweb models info back to the server to update the page html
         */
        doSave: function () {
            // For callbacks
            var self = this;

            // Update information
            var updates = {};

            // Disable widgets before saving
            this.app.disableWidgets();

            // Iterate through regions
            _.each(this.app.regions, function (region, key, list) {
                // Do our work on clone of region
                $region = $(region).clone();

                // Extract region metadata
                var uri = $region.attr('data-ew-uri');

                // Remove dynamic front-end additions
                _.each(self.app.config.removals, function (selector, key, list) {
                    $region.find(selector).remove();
                });

                // Store update info
                updates[uri] = {
                    content: $region[0].outerHTML
                };
            });

            // Show status message
            this.showMessage('Saving changes...');

            // Save updates back to server
            var saving = this.model.save({
                updates: updates
            })

            // Always execute
            .always(function () {
                // Enable widgets
                self.app.enableWidgets();

                // Clear message
                self.clearMessage();
            })

            // Success
            .done(function () {
                
            })

            // Error
            .fail(function () {
                
            });

            // Return xhr
            return saving;
        },
        /**
         * Hide all drawers.
         */
        hideDrawers: function () {
            // Hide all drawers
            this.$('.easelweb-drawer').removeClass('open');
        },
        /**
         * Hide all drawers and toolbars. Clears status in toolbar.
         * @param {boolean} showMain Flag to tell whether to show the main toolbar.
         */
        hideTools: function (showMain) {
            // Hide all drawers and navs
            this.hideDrawers();
            this.$('.navbar-nav').removeClass('on');

            // Clear status text
            this.$status.text('');

            // Clear the last widget edited
            this.currentWidget = null;

            // Clear source editor if it was created
            if (this.sourceEditor) {
                this.sourceEditor.setValue('');
                this.sourceEditor.refresh();
            }

            // Remove widget form
            this._clearWidgetForm();

            // Remove file uploader
            this._clearFileUploader();

            // Clear html from widget editor sections
            this._clearWidgetEditor();

            // Do we need to show the main nav
            if (showMain === true) {
                this.$('.navbar-main').addClass('on');
            }
        },
        /**
         * Clear the image editor
         */
        clearImgEditor: function () {
            // Remove preview images
            this.$('.easelweb-image-preview').empty();

            // Destroy uploader
            if (this.imageEditor) {
                $('.easelweb-imageupload').fileupload('destroy');
                this.imageEditor = null;
            }

            // Clear widget
            this.imageEditorWidget = null;
        },
        /**
         * Show the widget editor
         * @param {Backbone.View} widget The backbone widget view for the img tag
         * @param {object} options Settings editor options
         */
        initWidgetEditor: function (widget, options) {
            // Did we get a widget
            if (widget) {
                // Hide all tools and drawers
                this.hideTools();

                // Set current widget
                this.currentWidget = widget;

                // Show the widget metadata in the toolbar title so the user knows which widget they are editing
                this.$status.text("Tag: "+this.currentWidget.el.tagName);

                // Initialize widget form and source code editor
                this.initWidgetForm();
                this.initSourceEditor();

                // Display widget toolbar and editor drawer
                this.showWidgetEditor();

                // If widget is an IMG tag them automatically show file uploader
                if (this.currentWidget.el.tagName === 'IMG') {
                    if (this.widgetForm.fields && this.widgetForm.fields.src && this.widgetForm.fields.src.editor) {
                        this.initFileUploader(this.widgetForm.fields.src.editor);
                    }
                }
            }
        },
        /**
         * Initialize the source code editor
         */
        initSourceEditor: function () {
            // For callbacks
            var self = this;

            // Create source code editor if not created
            if (!this.sourceEditor) {
                // Init code mirror, and append to the drawer
                this.sourceEditor = CodeMirror(this.$srcEditorDrawer[0], {
                    mode: "text/html",
                    lineNumbers: true,
                    autofocus: true
                });

                // Set size to 80% of window
                this.sourceEditor.setSize(null, $(window).height() * 0.8);

                // Auto update source changes
                this.sourceEditor.on('change', function () {
                    if (self.currentWidget) {
                        // Set html of widget to editor source code
                        self.currentWidget.updateHTML(self.sourceEditor.getValue());

                        // Re-init widget schema (used to generate the widget form)
                        self.currentWidget.generateSchema();

                        // Re-create widget form
                        self._clearWidgetForm();
                        self._clearFileUploader();
                        self._clearWidgetEditor();
                        self.initWidgetForm();
                    }
                    
                });
            }
        },
        /**
         * Initialize the widget form
         */
        initWidgetForm: function () {
            // For callbacks
            var self = this;

            // Create a form to edit settings
            if (!this.widgetForm && this.currentWidget) {
                this.widgetForm = new Backbone.Form({
                    model: this.currentWidget.model
                }).render();

                // Append form to widget drawer
                this._attachWidgetForm(this.widgetForm.el);

                // Auto commit on each change
                this.widgetForm.on('change', _.debounce(function (form) {
                    form.commit();
                }, 500));

                // Iterate through form schema keys, so that we can attach
                // focus event listners to the ones with "src" in the name.
                // We need to generate the upload form for widget attributes with "src"
                // in the name so that the user can upload files.
                _.each(this.currentWidget.model.schema, function (value, key, list) {
                    // Is this a "src" attribute
                    if (key.match(/src$/)) {
                        // Attach listener to init uploader on focus
                        self.widgetForm.on(key+':focus', function (form, editor, extra) {
                            // show file uploader, bind to the currently focused editor
                            self.initFileUploader(editor);
                        });
                    }
                });
            }
        },
        /**
         * Init the file uploader
         * @param {Backbone.Forms.editor} editor The backbone forms editor to tie uploaded info to
         */
        initFileUploader: function (editor) {
            if (!this.fileUploader) {
                // For callbacks
                var self = this;

                // Add file uploader template to editor drawer
                this.$widgetEditorDrawer.find('.easelweb-widget-preview').append(TplUploader);

                // Create preview image make responsive so it fits in uploader preview area
                var $preview_img = $('<img>');
                $preview_img.addClass('img-responsive img-thumbnail').height(150);
                $preview_img.attr('src', editor.getValue());
                this.$widgetEditorDrawer.find('.easelweb-image-preview').append($preview_img);

                // Create title
                this.$widgetEditorDrawer.find('[data-bind="upload-title"]').text('Viewing: '+editor.schema.title);

                // Init jquery fileuploader
                this.fileUploader = this.$widgetEditorDrawer.find('.easelweb-widget-upload-input').fileupload({
                    url: self.app.config.uploadUrl,
                    dataType: 'json',

                    // Handle completed uploads
                    done: function (e, data) {

                        // Interate through uploaded files
                        $.each(data.result.files, function (index, file) {
                            // Update thumbnail preview
                            $preview_img.attr('src', file.thumbnailUrl);

                            // Set value of editor
                            editor.setValue(file.url);

                            // Commit changes to form
                            self.widgetForm.commit();

                            // Reset progress bar
                            self.$widgetEditorDrawer.find('.easelweb-widget-uploader .progress-bar').width(0);
                        });
                    },

                    // Handle progress
                    progress: function (e, data) {
                        // Update progress bar
                        self.$widgetEditorDrawer.find('.easelweb-widget-uploader .progress-bar').css('width', parseInt(data.loaded/data.total * 100, 10)+'%');
                    }
                });
            }
        },
        /**
         * Show a message
         * @param {string} msg The message to display
         */
        showMessage: function (msg) {
            // Hide other drawers
            this.hideDrawers();

            // Hide main nav
            this.$('.navbar-nav').removeClass('on');

            // Show the message
            this.$msgDrawer.html('<p class="lead text-center">'+msg+'</p>');
            this.$msgDrawer.addClass('open');
        },
        /**
         * Clear message
         */
        clearMessage: function () {
            // Hide other drawers
            this.hideDrawers();

            // Clear the message
            this.$msgDrawer.empty();

            // Show main nav
            this.$('.navbar-main').addClass('on');
        },
        /**
         * Show the source code editor with the current widget's content.
         */
        showSourceEditor: function () {
            // Hide other drawers
            this.hideDrawers();

            // Show the source editor drawer
            this.$srcEditorDrawer.addClass('open');

            // Set editor content and refresh codemirror editor
            this.sourceEditor.setValue(this.currentWidget.el.outerHTML);
            this.sourceEditor.refresh();
        },
        /**
         * Show the settings editor with the current widget.
         */
        showWidgetEditor: function () {
            // Hide other drawers
            this.hideDrawers();

            // Display widget editor drawer
            this.$widgetEditorDrawer.addClass('open');

            // Show the widget toolbar
            this.$widgetNav.addClass('on');
        },
        /**
         * Attach the widget form to the drawer
         * @param {DOM element} elem The DOM element to attach
         */
        _attachWidgetForm: function (elem) {
            this.$widgetEditorDrawer.find('.easelweb-widget-form').append(elem);
        },
        /**
         * Clear the widget editor drawer of controls
         */
        _clearWidgetEditor: function () {
            this.$widgetEditorDrawer.find('.easelweb-widget-form, .easelweb-widget-preview').empty();
        },
        /**
         * Clear the file uploader control
         */
        _clearFileUploader: function () {
            if (this.fileUploader) {
                this.$widgetEditorDrawer.find('.easelweb-widget-upload-input').fileupload('destroy');
                this.fileUploader = null;
            }
        },
        /**
         * Clear the file uploader control
         */
        _clearWidgetForm: function () {
            if (this.widgetForm) {
                this.widgetForm.remove();
                this.widgetForm = null;
            }
        }
    });

    // Export module
    return exports;
});
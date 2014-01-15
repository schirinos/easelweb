// Require Config
require.config({
    paths: {
        backbonePkg: "backbone/js/backbone-pkg",
        backbone: "backbone/js",
        etch: "etch/js/etch",
        codemirror: "codemirror/js",
        codemirrorPkg: "codemirror/js/codemirror-pkg",
        fileupload: 'fileupload/js',
        easelweb: 'easelweb/js',
        easelwebTpl: 'easelweb/tpl',
        jquery: 'jquery/js/jquery',
        bootstrap: 'bootstrap/js/bootstrap'
    },

    // Shim config for js libraries that don't use AMD "define"
    shim: {
        'bootstrap': {
            deps: ['jquery'],
        },
        // Backbone
        'backbone/underscore': {
            exports: '_'
        },
        'backbone/backbone-forms': {
            deps: ['backbone/backbone'],
        },
        'backbone/backbone-forms-bootstrap3': {
            deps: ['backbone/backbone-forms'],
        },
        'backbone/backbone': {
            deps: ['jquery', 'backbone/underscore'],
            exports: 'Backbone'
        },
        // Codemirror
        'codemirror/codemirror':{
            exports: 'CodeMirror'
        },
        'codemirror/mode/xml/xml':{
            deps: ['codemirror/codemirror']
        },
        'codemirror/mode/javascript/javascript':{
            deps: ['codemirror/codemirror']
        },
        'codemirror/mode/css/css':{
            deps: ['codemirror/codemirror']
        },
        'codemirror/mode/htmlmixed/htmlmixed':{
            deps: ['codemirror/codemirror']
        }
    },

    // For dev only, never load from cache
    urlArgs: "bust=" +  (new Date()).getTime()
});

// Useful polyfills
if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return this.replace(/^\s+|\s+$/gm, '');
    };
}

// Load application
require( ['easelweb/easelweb', 'bootstrap', 'jquery', 'fileupload/jquery.iframe-transport', 'fileupload/jquery.fileupload'], function(Easelweb, Cookies) {
    Easelweb.init();
});
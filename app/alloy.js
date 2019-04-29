// The contents of this file will be executed before any of
// your view controllers are ever executed, including the index.
// You have access to all functionality on the `Alloy` namespace.
//
// This is a great place to do any initialization for your app
// or create any global variables/functions that you'd like to
// make available throughout your app. You can easily make things
// accessible globally by attaching them to the `Alloy.Globals`
// object. For example:
//
// Alloy.Globals.someGlobalFunction = function(){};
var shelf = Alloy.Collections.instance('media');
shelf.fetch();

var user = null;

Alloy.Events = _.clone(Backbone.Events);

var toast = Alloy.createWidget('nl.fokkezb.toast', 'global', {
    // defaults
});

Alloy.Globals.toast = toast.show; // same as toast.info
Alloy.Globals.error = toast.error; // applies the 'error' theme

// Setup XHR
var xhr = new (require('ti.xhr'))();

console.log('EOF alloy.js');

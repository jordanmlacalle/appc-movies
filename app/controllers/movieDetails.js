// Arguments passed into this controller can be accessed via the `$.args` object directly or:
var details = $.args;

$.title.text = details.Title + ' (' + details.Year + ')';
$.poster.image = details.Poster;
$.plot.text = details.Plot;

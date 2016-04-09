var plugins = [];

function registerplugin(selector, pluginname, options) {
	plugins.push([selector, pluginname, options]);
}

$(document).ready(function() {

	for (var i = plugins.length - 1; i >= 0; i--) {
		$(plugins[i][0])[plugins[i][1]](plugins[i][2]);
	}

});

// the semi-colon before function invocation is a safety net against concatenated
// scripts and/or other plugins which may not be closed properly.
;( function( $, window, document, undefined ) {

	"use strict";

		// undefined is used here as the undefined global variable in ECMAScript 3 is
		// mutable (ie. it can be changed by someone else). undefined isn't really being
		// passed in so we can ensure the value of it is truly undefined. In ES5, undefined
		// can no longer be modified.

		// window and document are passed through as local variables rather than global
		// as this (slightly) quickens the resolution process and can be more efficiently
		// minified (especially when both are regularly referenced in your plugin).

		// Create the defaults once
		var pluginName = "meetupApi",
			defaults = {
				target: document,
				propertyName: "value"
			},
			templates = [],
			months_list = [
					"JAN",
					"FEB",
					"MAR",
					"APR",
					"MAY",
					"JUN",
					"JUL",
					"AUG",
					"SEP",
					"OCT",
					"NOV",
					"DEC"
				],
			$main_element = $("body main");
			console.log($main_element);

		// The actual plugin constructor
		function Plugin ( element, options ) {
			this.element = element;

			// jQuery has an extend method which merges the contents of two or
			// more objects, storing the result in the first object. The first object
			// is generally empty as we don't want to alter the default options for
			// future instances of the plugin
			this.settings = $.extend( {}, defaults, options );
			this._defaults = defaults;
			this._name = pluginName;
			this.init();
		}

		// Avoid Plugin.prototype conflicts
		$.extend( Plugin.prototype, {
			init: function() {
				this.createTemplate("event", ".event");
				this.requestEvents();
			},

			createTemplate: function(template_name, template_selector) {
				var $template_element = $(template_selector)
				templates[template_name] = $template_element.clone(true);
				$template_element.remove();
			},

			requestEvents: function() {
				$.ajax({
					method: "POST",
					url: "https://api.meetup.com/2/events?&sign=true&photo-host=public&group_urlname=webmeetup&page=5",
					dataType: "jsonp"
				})
				.done(function(data) {
					for (var event_index in data.results) {
						var event = data.results[event_index]
							,	event_date = new Date(event.time)
							,	$new_element = $($(templates["event"]).clone());

						$new_element.find(".event_date-day").html(event_date.getDate());
						$new_element.find(".event_date-month").html(months_list[event_date.getMonth()]);
						console.log($new_element);
						$("main").append($new_element);
						$main_element.append($new_element);
						console.log(event);
					}
				});
			}
		} );

		// A really lightweight plugin wrapper around the constructor,
		// preventing against multiple instantiations
		$.fn[ pluginName ] = function( options ) {
			return this.each( function() {
				if ( !$.data( this, "plugin_" + pluginName ) ) {
					$.data( this, "plugin_" +
						pluginName, new Plugin( this, options ) );
				}
			} );
		};

		registerplugin(defaults.target, pluginName);

} )( jQuery, window, document );
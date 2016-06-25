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
			$main_element = null,
			$events_wrapper = null;

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
				this.createTemplate("event", ".events__item");
				$events_wrapper = $("div.events");
				console.log(this);
			},

			getEvents: function() {
				this.requestApi("https://api.meetup.com/2/events?&sign=true&photo-host=public&group_urlname=webmeetup&page=5", "event", this.callbackEvents);
			},

			getRSVPlist: function() {
				this.requestApi("https://api.meetup.com/2/events?&sign=true&photo-host=public&group_urlname=webmeetup&page=5", "event");
			},

			callbackEvents: function(data) {
				for (var item_index in data.results) {
					var item = data.results[item_index]
						,	event_date = new Date(item.time)
						,	$new_element = $($(templates[request_template_type]).clone());

					$new_element.find(".date__day").html(event_date.getDate());
					$new_element.find(".date__month").html(months_list[event_date.getMonth()]);
					$new_element.find(".title--events").html(item.name);
					$new_element.find(".description--events").html(item.description);

					var $rsvp_list_person_element_original = $new_element.find(".rsvp-list__person");

					var $rsvp_list_person_element = $rsvp_list_person_element_original.clone();
					$rsvp_list_person_element_original.remove();

					//for (var person_index in data.results.

					console.log(data);
					$events_wrapper.append($new_element);
				}
			},

			createTemplate: function(template_name, template_selector) {
				var $template_element = $(template_selector)
				templates[template_name] = $template_element.clone(true);
				$template_element.remove();
			},

			requestApi: function(url, request_template_type, callback_function) {
				$.ajax({
					method: "POST",
					url: url,
					dataType: "jsonp"
				})
				.done(callback_function(data));
			},


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
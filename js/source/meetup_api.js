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
				$events_wrapper = $("div.events");
				this.createTemplate("rsvp-list__member", ".rsvp-list__member");
				this.createTemplate("event", ".events__item");
				this.getEvents();
			},

			getEvents: function() {
				this.requestApi("https://api.meetup.com/webmeetup/events?page=5", this.callbackEvents.bind(this));
			},

			getRSVPlist: function(event_id) {
				this.requestApi("https://api.meetup.com/webmeetup/events/"+event_id+"/rsvps", this.callBackRSVPlist.bind(this));
			},

			callbackEvents: function(data) {
				for (var item_index in data.data) {
					var item = data.data[item_index]
						,	event_date = new Date(item.time)
						,	$new_element = $($(templates["event"]).clone());

					if (item_index == 0) {
						$new_element.addClass("events__item--active");
					}

					$new_element.attr("data-event-id", item.id);
					$new_element.find(".date__day").html(event_date.getDate());
					$new_element.find(".date__month").html(months_list[event_date.getMonth()]);
					$new_element.find(".title--events").html(item.name);
					$new_element.find(".description--events").html(item.description);
					$new_element.find(".button--cta").attr("href", item.link);

					$new_element.find(".titlebar--events")[0].addEventListener("click", function(event) {
						if (!$(event.target).hasClass("button--cta")) {
							$(this).parent().toggleClass("events__item--active");
						}
					});

					// Get RSVP list
					this.getRSVPlist(item.id);

					$events_wrapper.append($new_element);
				}
			},

			callBackRSVPlist: function(data) {
				var maximum_members = 5
				  , rsvp_members = 0
				  , rsvp_yes_members = 0;

				for (var item_index in data.data) {
					var item = data.data[item_index];
					rsvp_members++;

					if (item.response === "yes") {
						rsvp_yes_members++;
						if (rsvp_yes_members < maximum_members+1) {
							var	member_photo = item.member.photo.thumb_link
								,	$new_element = $($(templates["rsvp-list__member"]).clone());

							$new_element.css("background-image", "url('"+member_photo+"')");
							$new_element.attr("title", item.member.name);

							var $rsvp_list_holder = $(".events__item[data-event-id='"+item.event.id+"']").find(".rsvp-list");

							$rsvp_list_holder.append($new_element);
						}
					}
				}

				if (rsvp_yes_members > maximum_members) {
					$new_element = $($(templates["rsvp-list__member"]).clone());
					$new_element.html(parseInt(rsvp_yes_members-maximum_members)+"+");
					$rsvp_list_holder.append($new_element);
				}
			},

			createTemplate: function(template_name, template_selector) {
				var $template_element = $(template_selector)
				templates[template_name] = $template_element.clone(true);
				$template_element.remove();
			},

			requestApi: function(url, callback_function) {
				$.ajax({
					method: "POST",
					url: url,
					dataType: "jsonp"
				})
				.done(function(data) {callback_function(data)});
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
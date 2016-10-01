var meetupApi;

$(document).ready(function() {

	$('.js_parallax').parallax({
		imageSrc: 'images/banner.jpg',
		naturalWidth: 2896,
		naturalHeight: 1944,
		speed: 0.5
	});

	$(window).trigger('resize').trigger('scroll');

	meetupApi = $.meetupApi();

	meetupApi.getUpcomingEvents();

	$("a[href='#upcoming-meetups']").click(function() {
		meetupApi.getUpcomingEvents();
		$(".events-menu__item--active").removeClass("events-menu__item--active");
		$(this).parent().addClass("events-menu__item--active");
	});

	$("a[href='#previous-meetups']").click(function() {
		meetupApi.getPastEvents();
		$(".events-menu__item--active").removeClass("events-menu__item--active");
		$(this).parent().addClass("events-menu__item--active");
	});

	$(".events-more__button").click(function() {
		meetupApi.getMoreEvents();
	});

});

"use strict";

;(function ($) {
	$.extend({
		meetupApi: function () {

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

		this._defaults = defaults;
		this._name = pluginName;

		return init();

		function init() {
			$events_wrapper = $("js_events");
			createTemplate("rsvp-list__member", ".rsvp-list__member");
			createTemplate("event", ".event");

			return {
				"getUpcomingEvents": getUpcomingEvents,
				"getPastEvents": getPastEvents,
				"getMoreEvents": getMoreEvents,
				"settings": {
					offset: 0,
					status: "upcoming",
					scroll: "next_upcoming"
				}
			}
		}

		function getNextPageEvents(url, order) {
			this.order = order;
			requestApi(url, callbackEvents.bind(this));
		}

		function getUpcomingEvents() {
			$events_wrapper.html("");
			this.settings.offset = 0;
			this.settings.add_events = false;
			this.settings.status = "upcoming";
			this.settings.scroll = "next_upcoming";

			requestApi("https://api.meetup.com/webmeetup/events?&page=20&status=" + this.settings.status + "&offset=" + this.settings.offset, callbackEvents.bind(this));
		}

		function getPastEvents() {
			$events_wrapper.html("");
			this.settings.offset = 0;
			this.settings.add_events = false;
			this.settings.status = "past";
			this.settings.order = "desc";

			requestApi("https://api.meetup.com/webmeetup/events?&page=20&status=" + this.settings.status + "&offset=" + this.settings.offset, callbackEvents.bind(this));
		}

		function getMoreEvents() {
			this.settings.add_events = true;
			this.settings.offset += 5;

			var callHandler = callbackEvents.bind(this);

			callHandler();

			if (this.settings.offset == 20) {

			}

			//requestApi("https://api.meetup.com/webmeetup/events?page=5&status=" + this.settings.status + "&offs1et=" + this.settings.offset, callbackEvents.bind(this));
		}

		function getRSVPlist(event_id) {
			requestApi("https://api.meetup.com/webmeetup/events/" + event_id + "/rsvps", callBackRSVPlist.bind(this));
		}

		function callbackEvents(response_data) {
			if (!this.settings.add_events) {
				$events_wrapper.html("");
			}

			if (this.settings.order == "desc") {
				response_data.data.reverse();
			}

			console.log(response_data);

			if (typeof response_data !== "undefined" && response_data.data !== this.settings.data) {
				this.settings.data = response_data.data;
			}

			console.log(this);


			for (var item_index = this.settings.offset; item_index < this.settings.offset + 5; item_index++) {
				var item = this.settings.data[item_index]
					,	event_date = new Date(item.time)
					,	$new_element = $($(templates["event"]).clone());

				if (item_index == 0 && !this.settings.add_events) {
					$new_element.addClass("event--active");
					$new_element.find(".events__item").addClass("events__item--active");
				}

				$new_element.find(".events__item").attr("data-event-id", item.id);
				$new_element.find(".date__day").html(event_date.getDate());
				$new_element.find(".date__month").html(months_list[event_date.getMonth()]);
				$new_element.find(".title--events").html(item.name);
				$new_element.find(".description--events").html(item.description);
				$new_element.find(".button--cta").attr("href", item.link);

				$new_element.find(".titlebar--events")[0].addEventListener("click", function(event) {
					if (!$(event.target).hasClass("button--cta")) {
						$(this).parent().removeAttr("style");
						$(this).parent().find(".description--events").removeAttr("style");
						$(this).parent().find(".description--events").removeClass("expanded");
						$(this).parent().find(".hr--events").removeClass("expanded");
						$(this).parent().toggleClass("events__item--active");
						$(this).parent().parent().toggleClass("event--active");
						$(this).parent().find(".events__container").removeAttr("style");
					}
				});

				// Get RSVP list
				getRSVPlist(item.id);

				$events_wrapper.append($new_element);

				var real_height = $new_element.find(".description--events").prop('scrollHeight')+25;
				var height = $new_element.find(".description--events").height();

				if (real_height > height) {
					$new_element.find(".events__item").attr("data-height", $new_element.prop('scrollHeight')+real_height);
					$new_element.find(".events__item").attr("data-description-height", real_height);
					$new_element.find(".hr--events").addClass("hr--expand");
					$new_element.find(".hr--events")[0].addEventListener("click", function(event) {
						$(this).toggleClass("expanded");
						$(this).prev().toggleClass("expanded");

						if ($(this).hasClass("expanded")) {
							$(this).prev().css("max-height", $(this).parent().parent().attr("data-description-height") + "px");
							$(this).parent().css("max-height", $(this).parent().parent().attr("data-height") + "px");
						} else {
							$(this).prev().removeAttr("style");
							$(this).parent().parent().removeAttr("style");
						}
					});
				}
			}

			$events_wrapper.removeClass("loading");
		}

		function callBackRSVPlist(data) {
			var maximum_members = 5
					, rsvp_members = 0
					, rsvp_yes_members = 0;

			for (var item_index in data.data) {
				var item = data.data[item_index];
				rsvp_members++;

				if (item.response === "yes") {
					rsvp_yes_members++;
					if (rsvp_yes_members < maximum_members+1) {
						var	member_photo = false;

						if (item.member.photo) {
							member_photo = item.member.photo.thumb_link;
						}

						var	$new_element = $($(templates["rsvp-list__member"]).clone());

						if (member_photo) {
							$new_element.css("background-image", "url('" + member_photo + "')");
						} else {
							$new_element.addClass("rsvp-list__member--nophoto");
						}

						$new_element.attr("title", item.member.name);

						var $rsvp_list_holder = $(".events__item[data-event-id='" + item.event.id + "']").find(".rsvp-list");

						$rsvp_list_holder.append($new_element);
					}
				}
			}

			if (rsvp_yes_members > maximum_members) {
				$new_element = $($(templates["rsvp-list__member"]).clone());
				$new_element.html(" + " + parseInt(rsvp_yes_members-maximum_members));
				$rsvp_list_holder.append($new_element);
			}
		}

		function createTemplate(template_name, template_selector) {
			var $template_element = $(template_selector)
			templates[template_name] = $template_element.clone(true);
			$template_element.remove();
		}

		function requestApi(url, callback_function) {
			$events_wrapper.addClass("loading");
			$.ajax({
				method: "GET",
				url: url,
				dataType: "jsonp"
			})
			.done(function(data) {callback_function(data)});
		}
	}
	});
})( jQuery );

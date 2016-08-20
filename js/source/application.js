var meetupApi;

$(document).ready(function() {

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

});

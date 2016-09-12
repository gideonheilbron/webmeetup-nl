var meetupApi;

$(document).ready(function() {

	$('.js_parallax').parallax({
		imageSrc: 'images/banner.jpg',
		naturalWidth: 2896,
		naturalHeight: 1944
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

var meetupApi;

$(document).ready(function() {

	meetupApi = $.meetupApi();

	meetupApi.getUpcomingEvents();

	$("a[href='#upcoming-meetups']").click(function() {
		meetupApi.getUpcomingEvents();
	});

	$("a[href='#previous-meetups']").click(function() {
		meetupApi.getPastEvents();
	});

});

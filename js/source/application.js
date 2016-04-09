var plugins = [];

function registerplugin(selector, pluginname, options) {
	plugins.push([selector, pluginname, options]);
}

$(document).ready(function() {

	for (var i = plugins.length - 1; i >= 0; i--) {
		$(plugins[i][0])[plugins[i][1]](plugins[i][2]);
	}

});

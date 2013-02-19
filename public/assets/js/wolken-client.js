"use strict";
		
var app = {};
app = {
	masterurl: window.location.protocol+"//"+window.location.host+"/ajax/",
	runit: function(){
		
		$("#heroheader").load(app.masterurl+"User");
	},
	ajax_success:{
		
		
	},
	runners: {
		install_events: function() {
			var event_element;
			for ( event_element in app.events ) {
				$(event_element).on(app.events[event_element]);
			}
		}
	}
};
app.events = {
	"#runbutton": {
		click:app.runit
	}
};
$(app.runners.install_events);

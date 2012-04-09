(function(app){
	var server = app.observer;
	app.user = {
		init:function(){
			//localStorage.setItem('login','0');
			server.trigger('user:beforeLogin');
		}
	};
}(App));
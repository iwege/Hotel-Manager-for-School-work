(function(app){
	var server = app.observer;
	app.user = {
		init:function(){
			localStorage.removeItem('login');
			server.trigger('user:beforeLogin');
		}
	};
}(App));
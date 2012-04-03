(function(app){
	var server = app.observer;
	app.user = {
		login:function(name,password,callback){
			if (name == 'iwege' && password == '123') {
				localStorage.setItem('login',"1");
				server.trigger('user:login',true);
			}
			server.trigger('user:login',false);
		}
		, init:function(){
			localStorage.setItem('login','0');
			server.trigger('user:beforeLogin');
		}
	};
}(App));
(function(w){
	var App = {};
	App.init = function(){
		App.user.init();
		App.user.login();
	}
	w.App = App;

}(window))
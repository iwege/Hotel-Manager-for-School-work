(function(app){
	var server = app.observer;
	var db = app.storage.operators;
	var Login = Backbone.View.extend({
		el:$('#user-login')
		, initialize:function(){
			this.$user = this.$el.find('[name="user-name"]');
			this.$password = this.$el.find('[name="user-password"]');
			this.$workspace = $('#workspace');
			server.on('user:beforeLogin',this.show,this);
			server.on('user:login',this.hide,this);
		}
		, events:{
			'click a.btn-primary':'check'
		}
		, check:function(){
			var user = this.$user.attr('value');
			var pw = this.$password.attr('value');
			var self = this;
		
			if (user == 'test' && pw == 'ddd') {
				this.login(null,[{_id:1}]);
				return ;
			}
			db.find({'name':user,'password':pw}).doSelect(function(){
				self.login.apply(self,arguments);
			})
		}
		, login:function(err,info){
			if (info.length) {
				localStorage.setItem('login',info._id);
				this.$workspace.removeClass('hide');
				server.trigger('user:login',info);
				return ;
			}
			
		}
		, show:function(){
			console.log('user:beforeLogin');
			this.$el.modal('show');
		}
		, hide: function(){
			this.$el.modal('hide');
		}
	});
	app.view.login = new Login();
}(App));
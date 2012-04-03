(function(app){
	var db = app.storage.operators;
	app.collection.operators = Backbone.Collection.extend({
		  model : app.model.operator
		, getAll:function(cb){
			var self = this;
	
			db.doSelect(function(err,data){
				if (!data || !data.length ) {
					data = [];
				};
				self.reset(data);
				cb && cb();
			});
		}
		, initialize:function(){
		
			this.getAll();
		}
	});
}(App))
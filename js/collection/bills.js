(function(app){
	var db = app.storage.bills;
	app.collection.bills = Backbone.Collection.extend({
		  model : app.model.bill
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
(function(app){
	var db = app.storage.rooms;
	app.collection.rooms = Backbone.Collection.extend({
		  model : app.model.room
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
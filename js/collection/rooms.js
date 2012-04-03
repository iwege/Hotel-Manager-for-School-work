(function(app){
	var db = app.storage.rooms;
	app.collection.rooms = Backbone.Collection.extend({
		  getAll:function(cb){
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
		, model : app.model.room
		
	});
}(App));
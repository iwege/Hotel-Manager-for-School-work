(function(app){
	var db = app.storage.operators;

	app.model.operator =  Backbone.Model.extend({
		idAttribute:'_id'
		, dbSave:function(opt){
			var self = this;
			var info = this.toJSON();
			delete info.id;
			db.save(info,function(err,id){
				self.set({"_id":id});
				opt && opt.success && opt.success(id);
			});
		}
		, delete:function(cb){
			var self = this;
			db.find({"_id":this.get('_id')}).doDelete(function(){
				cb && cb();
			});
		}
		, initialize:function(info){
			console.log('operator:init');
			var self = this;
			this.on('change',function(model,options){
				var opt = options;
				if (_.isFunction(options)) {
					opt = {};
					opt.success = options;
				}
				self.dbSave(opt);
			});
			
			if (!info.id) {
				this.set(info);
				self.dbSave();
			}

		}
		
	});
}(App))
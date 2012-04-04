(function(app){
	var db = app.storage.bills;
	app.model.bill =  Backbone.Model.extend({
		idAttribute:'_id'
		, dbSave:function(opt){
			var self = this;
			var info = this.toJSON();
			delete info.id;
			if (info._id == undefined) {
				delete info._id;
			}
			info.room_id = parseInt(info.room_id);
			info.cash_pledge = parseInt(info.cash_pledge);
			info.id_number = parseInt(info.id_number);
			info.age = parseInt(info.age);
			info.price = parseFloat(info.price);
		
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
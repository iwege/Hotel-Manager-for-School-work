(function(app){
	var server = app.observer;
	var bill = Backbone.View.extend({
		  el:$('#bill-view')
		, template :Handlebars.compile($('#bill-item-view').html())
		, collection:new app.collection.bills()
		, initialize:function(){
			var self = this;
			this.collection.on('reset',this.addAll,this);
			this.collection.on('add',this.addOne,this);
			this.$table = this.$el.find('table');
			server.on('search:end',function(data){
				self.collection.reset(data);
			});
			server.on('bill:refresh',function(){
				console.log('bill:refresh');
				self.collection.getAll();
			});
		}
		, events:{
			
		}
		, addAll:function(data){
			if (data.models) {
				data = data.models;
			}
			this.$el.find('tr[data-id]').remove();
			var self = this;
			data.forEach(function(item,i){
				if (item.toJSON) {
					item = item.toJSON();
				}
				console.log(item);
				self.addOne(item);
			});
		}
		, addOne:function(item){
			var html = this.template(item);
			console.log(html);
			this.$table.append(html);
		}
	});
	app.view.bill = new bill();
}(App));

(function(app){
	var server = app.observer;
	var db = app.storage.bills;
	var billSearch = Backbone.View.extend({
		  el:$('#bills-search')
		, initialize:function(){
			
		}
		, events:{
			
		}
		, search:function(info){
			db.find(info).doSelect(function(err, data){
				server.trigger('search:end',data);
			});
		}
		
	});
	app.view.billSearch = new billSearch();
}(App));
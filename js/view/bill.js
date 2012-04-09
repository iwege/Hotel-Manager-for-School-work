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
		  el:$('#bill-search')
		, initialize:function(){
			
		}
		, events:{
			"click a.btn":"search"
		}
		, search:function(){
			var $form = $("form[name='search']").serializeArray();
			var $fd = {};
		
			$form.forEach(function(item){
				$fd[item.name] = item.value;
			});
			var sql = 'SELECT * FROM bills WHERE 1 ';
			console.log($fd);
			if ($fd['search_client']) {
				sql += ' AND client_name LIKE "%'+$fd['search_client']+'%" ';
			}
			if ($fd['search_id']) {
				sql += ' AND id_number LIKE "%'+$fd['search_id']+'%"';
			}
			if ($fd['search_sex']) {
			
				sql += ' AND sex = "'+$fd['search_sex']+'"';
			}
			if ($fd['search_status']) {
				sql += ' AND checkout != ""';
			}
			if ($fd['search_room_id']) {
				sql += ' AND room_id = "'+$fd['search_room_id']+'"';
			}			
			
			console.log(sql);
			app.storage.db.SQL(sql,'',function(err, data){
				server.trigger('search:end',data);
			});
		}
		
	});
	app.view.billSearch = new billSearch();
}(App));
(function(app){
	app.view = {};
	var server = app.observer;
	var operator = Backbone.View.extend({
		  collection : new app.collection.operators()
		, el:$('#operator-list')
		, initialize:function(){
			var self = this;
			this.template = Handlebars.compile($('#operator-item-view').html());
			this.collection
						.on("reset",this.addAll.bind(this),this);
			this.collection
						.on('add',this.addOne.bind(this),this);
			this.collection
						.on('remove',this.remove.bind(this),this);
			server.on('operator:add',function(data){
					self.collection.add(data);
			});
			server.on('operator:edit',function(data){
					self.change(data);
			});
		}
		, events:{
			  'click a.delete ': 'remove'
			, 'click a.edit '	: 'showEdit' 
			, 'click a.add ': 'showEdit'
		}
		, addAll:function(data){
			var self=  this;
			data.forEach(function(item){
				self.addOne(item);
			})
		}
		, showEdit:function(evt){
			var id = evt.target.dataset.id;
			var model ;
			//todo get model;
			if (id) {
				model = this.collection.get(id);
			}
			server.trigger('operator:showEdit',model);
		}
		, addOne:function(data,show){
			var self = this;
			if (!data.get('_id')) {
				data.bind('change:_id',function(){
					self.addOne(data);
					data.unbind('change:_id');
				});
				return ;
			}
			var html = this.template(data.toJSON());
			this.$el.find('table').append(html);
			server.trigger('operator:hideEdit');
			
		}
		, remove:function(evt){
			var $el  = $(evt.target);
			var id = $el.data('id');
			var model = this.collection.get(id);
			var self = this;
			model.delete(function(){
				self.$el.find('table tr[data-id="'+id+'"]').remove();
			});
		}
		, change:function(data){
			data._id = data.id;
			var model  = this.collection.get(data.id);
			delete data.id;
			model.set(data);
			this.$el.find('table tr[data-id="'+data.id+'"]').replaceWith(this.template(data));
			server.trigger('operator:hideEdit');
		}
	});
	app.view.operator = new operator();
}(App));


(function(app){
	var server = app.observer;
	var operatorForm = Backbone.View.extend({
		el:$('#operator-edit')
		, events:{
			  'click a.btn.btn-primary':'save'
			, 'click [data-dismiss="modal"]':'hide'
			, 'keyup input[name]':'removeError'
		}
		, initialize:function(){
			this.$name = this.$el.find('[name="operator-name"]');
			this.$password = this.$el.find('[name="operator-password"]');
			this.$id = this.$el.find('[name="operator-id"]');
			this.$sumit = this.$el.find('a.btn.btn-primary');
			this.$title = this.$el.find('[name="operator-title"]');
			server.on('operator:showEdit',this.show,this);
			server.on('operator:hideEdit',this.hide,this);
		}
		, removeError:function(evt){
			
			var $input = $(evt.target);
			if ($input.attr('value').length) {
				$input.closest('.control-group').removeClass('error');
			}
		}
		, save :function(evt){
			var data = this.check(evt);
			if (!data) {
				this.$sumit
						.removeClass('disabled')
						.html('Save');
				return false;
			}
			var event  = data.id?'operator:edit':'operator:add';
			server.trigger(event,data);
		}
		, show:function(info){
			if (info && info.id) {
				this.$name.attr('value',info.get('name'));
				this.$password.attr('value',info.get('password'));
				this.$id.attr('value',info.get('_id'));
				this.$title.attr('value',info.get('title'));
			}else{
				this.$name.attr('value','');
				this.$password.attr('value','');
				this.$id.attr('value','');
				this.$title.attr('value','');
			}
			this.$el.modal({
				backdrop:true,
				show:true
			});
		}
		, hide:function(){
			this.reset();
			this.$el.modal('hide');
		}
	
		, check:function(evt){
			this.$sumit.addClass('disabled').html('Saving');
			var fd = this.$el.find('form')
						.serializeArray();
			var info = {};
			var error = 0;
			fd.forEach(function(item){
				info[item.name.replace('operator-','')] = item.value;
			});
			if (_.isEmpty(info['name'])) {
				error = 1;
				this.$name.closest('.control-group').addClass('error');
			}else{
				this.$name.closest('.control-group').removeClass('error');
			}
			if (_.isEmpty(info['title'])) {
				error =1;
				this.$title.closest('.control-group').addClass('error');
			}else{
				this.$title.closest('.control-group').removeClass('error');
			}
			
			if (_.isEmpty(info['password'])) {
				error = 1;
				this.$password.closest('.control-group').addClass('error');
			}else{
				this.$password.closest('.control-group').removeClass('error');
			}
			
			
			if (error) {
				return false ;
			}
			
			return info;
			
		}
		, reset:function(){
			this.$sumit
					.removeClass('disabled')
					.html('Save');
			this.$el.find('.control-group').removeClass('error');
		}
	});
	app.view.operatorForm = new operatorForm();
}(App));
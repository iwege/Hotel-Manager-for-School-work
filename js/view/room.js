(function(app){
	var server = app.observer;
	var room = Backbone.View.extend({
		  collection : new app.collection.rooms()
		, el:$('#room-view')
		, initialize:function(){
			var self = this;
			console.log('roomView:init');
			this.$list = $('#room-list').isotope({ 
				  itemSelector: '.room-item'
				, itemPositionDataEnabled:true
				, transformsEnabled:true
				, containerStyle:{ position: 'relative', overflow: 'hidden' }
				, getSortData : {
				    status : function( $elem ) {
				      return $elem.attr('data-status');
				    },
				    type : function( $elem ) {
				      return $elem.attr('data-type');
				    },
				    price : function ( $elem ) {
				      return $elem.attr('data-price');
				    }
				  }
			 });;
			this.template = Handlebars.compile($('#room-item-view').html());
			this.collection
						.on("reset",this.addAll.bind(this),this);
			this.collection
						.on('add',this.addOne.bind(this),this);
			this.collection
						.on('remove',this.remove.bind(this),this);
			server.on('room:add',function(data){
					delete data.room_id;
					data.room_status = 0;
					self.collection.add(data);
			});
			server.on('room:edit',function(data){
					self.change(data);
			});
		}
		, events:{
			  'click a.delete ': 'remove'
			, 'click a.edit '	: 'showEdit' 
			, 'click a.addRoom': 'showEdit'
			, 'click button.room-status':'status'
			, 'click button.room-price':'price'
			, 'click button.room-type':'type'
		}
		, addAll:function(data){
			var self=  this;
			data.forEach(function(item){
				self.addOne(item);
			})
		}
		, price:function(evt){
			var active = $(evt.target).hasClass('active');
			
			if (!active) {
				
				this.$list.isotope({sortBy:'price'});
			}else{
				this.$list.isotope({sortBy:'name'});
			}
		}
		, status:function(evt){
			var active = $(evt.target).hasClass('active');
			
			if (!active) {
				this.$list.isotope({filter:'[data-status=0]'});
			}else{
				this.$list.isotope({filter:'[data-name]'});
			}
		}
		, type:function(evt){
			var self = this;
			setTimeout(function(){
				var filter = '*';
				var $active = $('.room-type:not(.active)');
				if ($active.length != 3) {
					$active.each(function(i,item){
						filter += ':not([data-type="'+$(item).html()+'"])';
					});	
				}
				console.log(filter);
				self.$list.isotope({filter:filter});
			},0);
			
		}
		, showEdit:function(evt){
			var id = evt.target.dataset.id;
			var model ;
			//todo get model;
			if (id) {
				model = this.collection.get(id);
			}
			server.trigger('room:showEdit',model);
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
			this.$list.isotope( 'insert', $(html) );
			server.trigger('room:hideEdit');
			
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
			server.trigger('room:hideEdit');
		}
	});
	app.view.room = new room();
}(App));



(function(app){
	var server = app.observer;
	var fm= Backbone.View.extend({
		el:$('#room-edit')
		, events:{
			  'click a.btn.btn-primary':'save'
			, 'click [data-dismiss="modal"]':'hide'
			, 'keyup input[name]':'removeError'
		}
		, initialize:function(){
			this.$name = this.$el.find('[name="room_name"]');
			this.$type = this.$el.find('[name="room_type"]');
			this.$id = this.$el.find('[name="room_id"]');
			this.$submit = this.$el.find('a.btn.btn-primary');
			this.$price = this.$el.find('[name="room_price"]');
			server.on('room:showEdit',this.show,this);
			server.on('room:hideEdit',this.hide,this);
			
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
				this.$submit
						.removeClass('disabled')
						.html('Save');
				return false;
			}
			var event  = data.id?'room:edit':'room:add';
			server.trigger(event,data);
		}
		, show:function(info){
			if (info && info.id) {
				this.$name.attr('value',info.get('room_name'));
				this.$type.attr('value',info.get('room_type'));
				this.$id.attr('value',info.get('_id'));
				this.$price.attr('value',info.get('room_price'));
			}else{
				this.$name.attr('value','');
				this.$id.attr('value','');
				this.$price.attr('value','');
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
			this.$submit.addClass('disabled').html('Saving');
			var fd = this.$el.find('form')
						.serializeArray();
			var info = {};
			var error = 0;
			fd.forEach(function(item){
				info[item.name] = item.value;
			});
			info['room_name'] = parseInt(info['room_name']);
			info['room_price'] = parseFloat(info['room_price']);
			if (_.isNaN(info['room_name'])) {
				error = 1;
				this.$name.closest('.control-group').addClass('error');
			}else{
				this.$name.closest('.control-group').removeClass('error');
			}
			if (_.isEmpty(info['room_type'])) {
				error =1;
				this.$type.closest('.control-group').addClass('error');
			}else{
				this.$type.closest('.control-group').removeClass('error');
			}
			
			if (_.isNaN(info['room_price'])) {
				error = 1;
				this.$price.closest('.control-group').addClass('error');
			}else{
				this.$price.closest('.control-group').removeClass('error');
			}
			
			
			if (error) {
				return false ;
			}
			
			return info;
			
		}
		, reset:function(){
			this.$submit
					.removeClass('disabled')
					.html('Save');
			this.$el.find('.control-group').removeClass('error');
		}
	});
	app.view.roomForm = new fm();
}(App));
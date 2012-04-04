(function(app){
	var server = app.observer;
	var db = app.storage.bills;
	var bill = app.model.bill;
	var checkout = Backbone.View.extend({
		  el:$('#room-checkout')
		, initialize:function(){
			var self =  this;
			this.arr = ['room_id','days','total_price','checkout'];
			this.arr.forEach(function(item){
				self['$'+item] = self.$el.find('input[name="'+item+'"]').keyup(function(){
					self['$'+item].closest('.control-group').removeClass('error');
				});
			})
			server.on('room:checkout',this.show,this);
			server.on('room:checkoutHide',this.hide,this);
		}
		
		, events:{
			'click a.btn-primary':'save'
			
		}
		, check:function(){
		
		}
		, save:function(){
			var self  = this;
			var info = {};
			info.days = this.$days.attr('value');
			info.checkout =  this.$checkout.attr('value');
			info.total_price = this.$total_price.attr('value');
			this.model.set(info);
			this.room.set({'room_status':0});
			server.trigger('room:checkoutSave',this.room.get('_id'));
			this.hide();
		}
		, show:function(model){
			this.room = model;
			this.reset(model.toJSON());
			this.$el.modal('show');
		}
		, hide:function(){
			this.$el.modal('hide');
		}
		, reset:function(info){
			var now  = new Date();
			var minute = 1000 * 60;
			var hour = minute * 60;
			var day = hour * 24;
			var halfamonth = day * 15;
			var month = day * 30;
			var self = this;
			db.find({_id:info.room_status}).doSelect(function(err,data){
				var checkin = new Date(data[0].checkin).getTime();
				var ms = now.getTime() - checkin;
				var days = ms/day;
				days = Math.ceil(days);
				self.$days.attr('value',days);
				self.$checkout.attr('value',dateFormat(new Date(),'yyyy/mm/dd HH:MM'));
				self.$total_price.attr('value',days*data[0].price);
				self.$el.find('.days').html(days);
				self.$el.find('.checkout').html(dateFormat(new Date(),'yyyy/mm/dd HH:MM'));
				self.$el.find('.total_price').html(days*data[0].price);
				self.model = new bill(data[0]);
			});
		}
	});
 	app.view.checkout = new checkout();
}(App))
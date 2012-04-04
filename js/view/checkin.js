(function(app){
	var server = app.observer;
	var bills = app.storage.bills;
	var model = app.model.bill;
	var checkin =  Backbone.View.extend({
		  el:$('#room-checkin')
		, initialize:function(){
			var arr = ['room_id','client_name','age','id_number','cash_pledge','checkin'];
			var self= this;
			this.arr = arr;
			
			arr.forEach(function(item){
				self['$'+item]= $('[name="'+item+'"]').keyup(function(){
					self['$'+item].closest('.control-group').removeClass('error');
				});
			});
			self.$sex  = $('.sex');
			
			server.on('room:checkin',this.show,this);
			server.on('room:checkinHide',this.hide,this);
		}
		, events:{
			'click a.btn-primary':'save'
			
		}
		, check:function(){
			var self = this;
			var error = 0;
			this.arr.forEach(function(item){
				if (_.isEmpty(self['$'+item].attr('value'))) {
					error = 1;
					self['$'+item].closest('.control-group').addClass('error');
				}
				if (item == 'age' && self['$'+item].attr('value') <= 0) {
					error = 1;
					self['$'+item].closest('.control-group').addClass('error');
				}
			});
			return error? false:true;
		}
		, save:function(){
			if (!this.check()) {
				return ;	
			}
			var self = this;
			var data = this.$el.find('form')
						.serializeArray();
			var info = {};
			data.forEach(function(item){
				info[item.name] = item.value;
			});
			
			info.sex =  this.$el.find('.sex.active').html();
			info.price = this.model.get('room_price');
			console.log(JSON.stringify(info));
			var bill = new model(info);
			
			if (!bill.get('_id')) {
				console.log('didn\'t get id');
				bill.on('change:_id',function(){
					if (bill.get("_id")) {
						self.model.set({'room_status':bill.get('_id')});
						server.trigger('room:checkinSave',bill);
						self.hide();
						bill.off('change:_id');
					}
					
				});
				return ;
			}
			self.model.set({'room_status':"1"});
			server.trigger('room:checkinSave',bill);
			self.hide();
			
			
		}
		, show:function(info){
			this.model = info;
			this.reset(info.toJSON());
			this.$el.modal('show');
		}
		, bindData:function(){
			
		}
		, hide:function(){
			this.$el.modal('hide');
		}
		, reset:function(info){

				this.$checkin.attr('value',dateFormat(new Date(),'yyyy-mm-dd HH:MM'));
				this.$room_id.attr('value',info._id);
				this.$client_name.attr('value','');
				this.$age.attr('value',0);
				this.$id_number.attr('value','');
				this.$cash_pledge.attr('value',0);
			
		}
	});
	app.view.checkin = new checkin();
}(App))
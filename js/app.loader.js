yepnope([{
	  load:['js/lib/underscore.js'
	  		,'js/lib/jquery.js'
	  		,'js/lib/jquery.isotope.js'
	  		,'css/style.css'
			,'js/lib/backbone.js'
			,'js/lib/snake.js'
			,'js/lib/handlebars.js'
			,'js/lib/dateformat.js'
	]}
	,{
		load:[
				'bootstrap/docs/assets/js/bootstrap-button.js'
				,'bootstrap/docs/assets/js/bootstrap-tab.js'
				,'bootstrap/docs/assets/js/bootstrap-dropdown.js'
				,'bootstrap/docs/assets/js/bootstrap-tooltip.js'
				,'bootstrap/docs/assets/js/bootstrap-popover.js'
				,'bootstrap/docs/assets/js/bootstrap-collapse.js'
				,'bootstrap/docs/assets/js/bootstrap-modal.js'
				,'bootstrap/docs/assets/js/bootstrap-alert.js'
				,'bootstrap/docs/assets/js/bootstrap-typeahead.js'
		]
	}
	,{
		load:[
			  'js/app.core.js'
			, 'js/app.config.js'
			, 'js/app.observer.js'
			, 'js/app.storage.js'
			, 'js/app.login.js'
		],
	},{
		load:[
			  'js/app.model.js'
			, 'js/app.collection.js'
			, 'js/model/bill.js'
			, 'js/model/operator.js'
			, 'js/model/room.js'
			, 'js/collection/operators.js'
			, 'js/collection/rooms.js'
			, 'js/collection/bills.js'
			
		]
	},{
		load:[
			  'js/view/operator/list.js'
			, 'js/view/room.js'
			, 'js/view/bill.js'
			, 'js/view/checkin.js'
			, 'js/view/checkout.js'
			, 'js/view/login.js'
		]
		, complete:function(){

			App.init();
		}
	}]);
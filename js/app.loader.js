yepnope([{
	  load:['js/lib/underscore/underscore.js'
	  		
	  		,'js/lib/jquery/dist/jquery.js'
			,'js/lib/backbone/backbone.js'
			,'js/lib/snake/build/snake.js'
			,'js/lib/handlebars/dist/handlebars.js'
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
		],
	},{
		load:[
			  'js/app.model.js'
			, 'js/app.collection.js'
			, 'js/model/bill.js'
			, 'js/model/operator.js'
			, 'js/model/room.js'
			, 'js/collection/operators.js'
		]
	},{
		load:[
			'js/view/operator/list.js'
		]
	}]);
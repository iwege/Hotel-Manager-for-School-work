(function(app){
	app.config = {
		  appName: 'Hotel Manager'
		, websql: {
			  pre_sql:''
			, config:{
				  name:'HotalManager'
				, description:'HotalManager'
				, size : ''
				, version: '1.0'
			}
			, tables:{
				 Bills : {
					  tableName:'bills'
					, columns:{
						  bill_id:{type:'integer'}
						, room_id:{type:'integer'}
						, clint_name:{type:'text'}
						, cash_pledge:{type:'integer'}
						, add_date:{type:'text'}
						, leave_data:{type:'text'}
						, days:{type:"integer"}
						, price:{type:"integer"}
						, total_price:{type:"integer"}
						, id_number:{type:"integer"}
						, age:{type:"integer"}
						, sex:{type:"text"}
					}
				}
				, Operators : {
					 tableName:'operators'
					, columns : {
						  opera_id:{type:'integer'}
						, name:{type:'text'}
						, title:{type:'text'}
						, password:{type:'text'}
					} 
				}
				, Rooms : {
					  tableName:'rooms'
					, columns:{
						  room_name : {type:'integer'}
						, room_type : {type:'text'}
						, room_price: {type:'integer'}
						, room_status:{type:'integer'}
					}
				}
			}
		}
	};
}(App));
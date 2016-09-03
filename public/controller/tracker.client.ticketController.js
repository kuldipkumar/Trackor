angular.module('ticket', [])

.controller('mainController',function($scope, $http) {

    $scope.formData = {};
    $scope.ticketData = {};
    $scope.areaData ={};
    var _MS_PER_DAY = 1000 * 60 * 60 * 24;

    $http.get('/tickets')
        .success(function(data) {
            var results = [];
            
            var today = new Date();//.getDate();
            for (i=0;i<data.length;i++){
            	var item = [];
            	item.id 			=	data[i]._id;
            	item.Done 			= 	data[i].Done;
            	item.Number 		=	data[i].Number;
            	item.Summary 		= 	data[i].Summary;
            	item.Status 		=	data[i].Status;
            	item.Priority 		=	data[i].Priority;
            	item.Area			=	'';
            	item.AssignmentGrp	=  	data[i].AssignmentGrp;
            	item.AssignedTo 	= 	data[i].AssignedTo;
            	item.Remark 		=	data[i].Remark;//data[i].Remark;
            	item.DeadLineDate 	=	nodeToJSDate(data[i].DeadLineDate);
            	item.Ageing			=	dateDiffInDays(data[i].CreatedOn, new Date());//dateDiffInDays(today,data[i].CreatedOn.getDate());
            	item.Update     	=   dateDiffInDays(data[i].UpdatedOn, new Date());//dateDiffInDays(today,data[i].UpdatedOn.getDate());
            	results.push(item);
            }
            
            $http.get('/area').success(function(data){
            	var area = [];
            	for(i=0;i<data.length;i++){
            		var entry = [];
            		entry.Area = data[i].Area;
            		entry.AssignmentGrp = data[i].AssignmentGrp;
            		area.push(entry);
            	}
            	results = setArea(results,area);
        	})
        	.error(function(data){
        		console.log(error);
        	})
            
            $scope.ticketData = results;
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
   
    
   $scope.showTickets = function(){
		  $http.get('/tickets').success(function(data) {
            $scope.ticketData = data;
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
	}
    
    $scope.updateTicket = function() {
    	var appData = $scope.ticketData;
    	var formDataList = [];
    	for(i=0;i<appData.length;i++){
			var item = {
					id:appData[i].id, 
					Remark:appData[i].Remark,
					DeadLineDate:appData[i].DeadLineDate
			}
			formDataList.push(item);
    	}
       $http.post('/updateTicket',{updateData: formDataList})
            .success(function(data) {
            	$http.get('/tickets');
            })
            .error(function(data) {
                console.log('Error: ' + data);
			});
    };
    
    
  //a and b are javascript Date objects
   function dateDiffInDays(pastDate,presentDate) {
	pastDate = pastDate.replace('T', ' ').substr(0, 10);
	var diffInMS =presentDate.getTime()-new Date(pastDate).getTime();
	var dayInMS = 1000*60*60*24;
	return Math.ceil(diffInMS/dayInMS);
  }
   
   function nodeToJSDate(date){
	   if(null==date) return '';
	   var date = new Date(date);
	   var year = date.getFullYear();
	   var month = date.getMonth()+1;
	   if(month<10){
		   month = '0'+month;
	   }
	   var day = date.getDate();
	   if(day<10){
		   day = '0'+day;
	   }
	   return year+'-'+month+'-'+day;
   }
   
   function setArea(results,area){
	   console.log(area);
	   console.log(results);
	   for(i=0;i<results.length;i++){
		   for(j=0;j<area.length;j++){
			   if(results[i].AssignmentGrp==area[j].AssignmentGrp){
				   results[i].Area = area[j].Area;
			   }else if(results[i].AssignedTo===area[j].AssignmentGrp){
				   results[i].Area = area[j].Area;
		   	}
		   }//inner for
	   }//outer for
	   return results;
   }
    
});




angular.module('leave', [])

.controller('leaveController',function($scope, $http) {

    $scope.formData         = {};
    $scope.leaveData        = {};
    $scope.addLeave         = {};
    $scope.monthData        = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    $scope.presentMonth     = $scope.monthData[new Date().getMonth()];
    $scope.yearData         = ['2016','2017','2018','2019','2020'];
    $scope.presentYear      = new Date().getFullYear();
    $scope.yearMonth        = {};
    $scope.resourceAndLeave = [];
	
    
    $http.get('/resourceLeaves')
        .success(function(data) {
			var leavesArry = [];
			var data = data.docs;
        	for(counter=0;counter<data.length;counter++){
				var name = data[counter].name;
        		var location = data[counter].location;
				$http.post('/resourceAndLocationLeave',{updateData: [name,location]})
				.success(function(leaveData) {
					console.log("Hello:"+leaveData.rname+" - " +leaveData.pLeave+" - " + leaveData.lLeave);
					console.log(leaveData);
					var leaveObj ={
						resource : leaveData.rname,
						leave:getResourceLeave(leaveData.pLeave,leaveData.lLeave)
					}
					leavesArry.push(leaveObj);
				   })
				.error(function(error) {
					console.log('Error: ' + error);
				});
        	}
        $scope.resourceAndLeave = leavesArry;
        
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });

    $scope.loadLeave = function(req,res){
      $http.get('/resourceLeaves')
        .success(function(data) {
          })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    }

    $scope.saveLeave = function(req,res){
    	var data = $scope.addLeave;
console.log(data);
    	$http.post('/saveLeave',data).success(function(data,sucess) {
			 $("#dataDiv").show();
	   	  	 	$("#addresource").hide();
      })
      .error(function(error) {
          console.log('Error: ' + error);
      });
	}//end save


    function getResourceLeave(personalLeaves,locationLeave){
      $scope.yearMonth = {
        year  : $scope.yearMonth.year == null ? new Date().getFullYear() :  $scope.yearMonth.year,
        month : $scope.yearMonth.month == null ? new Date().getMonth() :  $scope.yearMonth.month
      }
      var monthLength = getMonthLength($scope.yearMonth.year, $scope.yearMonth.month);
      var colors = [];

    	for(i=1;i<=monthLength;i++){
    		var color = "WHITE";
    		var date = new Date( $scope.yearMonth.year, $scope.yearMonth.month,i);
    		var day = date.getDay();

    		for(k=0;k<personalLeaves.length;k++){
    			if(date.getDate()==new Date(personalLeaves[k]).getDate()){
    				color = "#C0DEED";
    			}
    		}

    		for(j=0;j<locationLeave.length;j++){
    			if(date.getDate()==new Date(locationLeave[j]).getDate()){
    				color = "ORANGE";
    			}
    		}
    		if(date.getDate()==new Date().getDate()){
    			color = "GREEN";
    		}
    		if(day>5||day<1){
    			color= 'GREY';
    		 }
         var leavObj = {
           dayNo : i,
           colorName: color
         }
    		colors.push(leavObj);
       }
       return colors;
     }

     function getMonthLength(year,month){
       var monthStart = new Date(year,month, 1);
     	 var monthEnd = new Date( year,month + 1, 1);
       return Math.round((monthEnd - monthStart) / (1000 * 60 * 60 * 24));
     }

  });

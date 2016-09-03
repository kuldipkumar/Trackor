angular.module('leave', [])

.controller('leaveController',function($scope, $http) {

    $scope.formData = {};
    $scope.leaveData = {};
    $scope.addLeave ={};

    $http.get('/leaves')
        .success(function(data) {
            $scope.leaveData = data;
            console.log(data);
            
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    
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
    
    
    
   
  });




angular.module('resource', [])

.controller('resourceController',function($scope, $http) {

    $scope.formData = {};
    $scope.resourceData = {};
    $scope.addResource={};
    $scope.resource={};

    $http.get('/resource')
        .success(function(data) {
        	$scope.resourceData = data;
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
    
    $scope.saveResource = function(req,res){
    	var data = $scope.addResource;
		 $http.post('/saveResource',data).success(function(data,sucess) {
			 $("#dataDiv").show();
   	  	 	$("#addresource").hide();
      })
      .error(function(error) {
          console.log('Error: ' + error);
      });
	}//end save
    
    $scope.fetchOneResource = function(id,req,res){
    	
    	 $scope.resource = id;
    	console.log('inside fetch');
    	console.log(id.ibmid);
    	console.log(id.name);
    	
    }
    
    
    $scope.updateResource = function(req,res){
    	var data = $scope.resource;
    	console.log(data.ibmid);
    	console.log(data.name);
		 $http.post('/updateResource',data).success(function(data,sucess) {
			 $("#dataDiv").show();
			 $('#updateResource').hide();
   	  	 	$("#addresource").hide();
      })
      .error(function(error) {
          console.log('Error: ' + error);
      });
	}//end save
    
  });




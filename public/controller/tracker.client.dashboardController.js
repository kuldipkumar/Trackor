 var myApp = angular.module('dashboard', []);
myApp.controller('displayController', function($scope, $http,fileUpload) {

    //$scope.formData = {};
    $scope.ticketData = {};
	var date = new Date();
	
	$scope.mydate = date.getFullYear() + '-' + ('0' + (date.getMonth() + 1)).slice(-2) + '-' + ('0' + date.getDate()).slice(-2);

	/*$scope.uploadFile = function() {
		var f = document.getElementById('uploadFileId').files[0],
	        r = new FileReader();
		var fileName = $scope.uploadFile;
		console.log(fileName);
	    r.onloadend = function(e) {
	        var data = e.target.result;
	        //console.log(data);
	        var fd = new FormData();
	        fd.append('file', data);
	        fd.append('file_name', f.name);
	       $http.get('/upload', fileName,{
	            transformRequest: angular.identity,
	            headers: {'Content-Type': undefined}
	       })
	        .success(function(){
	            console.log('success');
	        })
	        .error(function(){
	            console.log('error');
	        });
	    };
	    		   //, 
	    
	    r.readAsDataURL(f);
	}
	*/
	
	
   $scope.showTickets = function(){
		  $http.get('/tickets').success(function(data) {
            $scope.ticketData = data;
        })
        .error(function(error) {
            console.log('Error: ' + error);
        });
	}
    
   $scope.uploadFile = function(){
       var file = $scope.myFile;
       
       console.log('file is ' );
       console.dir(file);
       
       var uploadUrl = "/upload";
       fileUpload.uploadFileToUrl(file, uploadUrl);
    };
   
   
   
    
});


myApp.directive('fileModel', ['$parse', function ($parse) {
   return {
      restrict: 'A',
      link: function(scope, element, attrs) {
         var model = $parse(attrs.fileModel);
         var modelSetter = model.assign;
         
         element.bind('change', function(){
            scope.$apply(function(){
               modelSetter(scope, element[0].files[0]);
            });
         });
      }
   };
}]);
myApp.service('fileUpload', ['$http', function ($http) {
    this.uploadFileToUrl = function(file, uploadUrl){
       var fd = new FormData();
       fd.append('file', file);
    
       $http.post(uploadUrl, fd, {
          transformRequest: angular.identity,
          headers: {'Content-Type': undefined}
       })
    
       .success(function(){
       })
    
       .error(function(){
       });
    }
 }]);



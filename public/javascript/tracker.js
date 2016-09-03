$(document).ready(function() {
	if($('#uploadDatePicker')){
		$('#uploadDatePicker').dcalendarpicker({
			format : 'dd-mm-yyyy'
		});
	}
	
	
	$('.dateInputClass').dcalendarpicker({
		format : 'yyyy-mm-dd'
	});
	
	
	
	if($('#endDateValueId')){
		$('#endDateValueId').dcalendarpicker({
			format : 'yyyy-mm-dd'
		});
	}
	
	
	if($('#startDate')){
		$('#startDate').dcalendarpicker({
			format : 'dd-mm-yyyy'
		});
	}
	
	
	$('.endDatePicker').dcalendarpicker({
		format : 'dd-mm-yyyy'
	});
	
	if($('#showExcel')){
		$('#showExcel').click(function(){
			$("#excelUnFriendlytable").hide();
			$("#excelFriendlytable").show();
			$("#showExcel").hide();
			$("#showHTML").show();
			
		   window.open('data:application/vnd.ms-excel,' + encodeURIComponent(document.getElementById("excelFriendlytable").outerHTML));
		})
	}

	if($('#showHTML')){
		$('#showHTML').click(function(){
			$("#excelUnFriendlytable").show();
			$("#excelFriendlytable").hide();
			$("#showExcel").show();
			$("#showHTML").hide();
		})
	}

})

function getTicketForResource(resource) {
	$('#resourceName').val(resource);
	document.getElementById('workLoadForm').submit();
}
function logOut() {
	document.getElementById('logOutForm').submit();
}


function searchAjax() {
	//var data = {}
	//data["query"] = $("#query").val();
	$.ajax({
		type : "POST",
		contentType : "application/json",
		url : "ItemTracker/createWorkItem.html",
		//data : JSON.stringify(data),
		dataType : 'json',
		timeout : 100000,
		success : function(data) {
			console.log("SUCCESS: ", data);
			display(data);
		},
		error : function(e) {
			console.log("ERROR: ", e);
			display(e);
		},
		done : function(e) {
			console.log("DONE");
		}
	});
}
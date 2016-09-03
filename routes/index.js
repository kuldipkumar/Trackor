
/*
 * GET home page.
 */

exports.index = function(req, res){
 // res.render('index', { title: 'Express' });
  
  var rowList1  = new Array();
  var rowList = [{ticketid:'12345',asgnto:'kuldip',status:'done'},{ticketid:'54321',asgnto:'kumar',status:'notdone'}] 
  getName(function(data,res){
	  rowList = data;
	  //res.JSON(rowList);
	  res.writeHead('Aahana Test')
      console.log(name);

      /*res.render('index', {
          title: name,
          year: date.getFullYear()
      });*/
  });
  
  
};

function getName(){
	
	var pg = require('pg');
	var conString = "postgres://postgres:@localhost:5432/tracker";


	var client = new pg.Client(conString);
	client.connect();

	
	var query = client.query("SELECT * FROM ticket fetch first 10 rows only");
	//fired after last row is emitted

	var rowList  = new Array();
	
	query.on('row', function(row) {
		rowList.push(row);
	    console.log(row);
	});

	query.on('end', function() {
	    client.end();
	});
}
	/*var MongoClient = require('mongodb').MongoClient;
	MongoClient.connect("mongodb://localhost:27017/TestDB", function(err, db) {
	if(!err) {
		 var collection = db.collection('employee');
		 collection.findOne({empid:'704505'}, function(err, objs){
    var empname;
        if (objs.length == 1) {
            empname = objs[0].name;
            console.log(empname); // this prints "Renato", as it should
            return empname;
        }
    });
    }*/
//});

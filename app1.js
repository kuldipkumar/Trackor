/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  , http = require('http')
  , path = require('path')
  , xlsx = require('node-xlsx')
  , fs = require("fs")
  , excel = require('xlsx')
  , db = require('mongodb').Db
  , multer  =   require('multer');

var MongoClient = require('mongodb').MongoClient;
var db;
var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('html', require('ejs').renderFile);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


app.get('/',function(req,res){
	res.sendfile('views/dashboard.html'); 
})

app.get('/',function(req,res){
	      res.sendFile(__dirname + "/index.html");
});


app.get('/show',function(req,res){
	res.sendfile('views/index.html'); 
})


app.get('/tickets', function(req,res){
	var collection = db.collection('ticket');
	// Lets iterate on the result
	collection.find({"Priority" : "Priority 2"}).toArray(function(err, result) {
		return res.json(result);
        db.close();
	});
});


app.post('/upload',function(req,res){
    fs.readFile(req.files.uploadFile.path, function (err, data){ // readfile from the given path
        var dirname = path.resolve(".")+'/uploads/'; // path.resolve(“.”) get application directory path
        var newPath = dirname +   req.files.uploadFile.name; // add the file name
        fs.writeFile(newPath, data, function (err) { // write file in uploads folder
	        if(err){
	           res.json("Failed to upload your file");
	        }else {
	        	var data = readExcelData(newPath)
	        	insertExcelData(data);
	        	res.redirect('/show');
	        }
        });
    });
	        
});

function insertExcelData(data){
	var collection = db.collection('ticket');
    // Insert some users
    for (i=1; i<=data.length; i++){
		if(null!=data[i]){
			var ticket = {
				_id: data[i].Number,
				Summary : data[i].Summary,
				Status : data[i].Status,
				Priority: data[i].Priority,
				AssignmentGrp: data[i].SubCategory,
				AssignedTo : data[i].AssignedTo,
				CreatedOn: data[i].Created,
				UpdatedOn: data[i].Updated
			};
			collection.insert([ticket], function (err, result) {
			  if (err) {
				console.log(err);
			  } else {
				console.log('Inserted %d documents into the "ticket" collection. The documents inserted with "_id" are:', result.length, result);
			  }
			});
		}
    }
	
}	

function readExcelData(newPath){
	var workbook =  excel.readFile(newPath);
	var data = [];
	var sheet_name_list = workbook.SheetNames;
	sheet_name_list.forEach(function(y) {
		var worksheet = workbook.Sheets[y];
		var headers = {};
		for(z in worksheet) {
			if(z[0] === '!') continue;
			//parse out the column, row, and value
			var col = z.substring(0,1);
			var row = parseInt(z.substring(1));
			var value = worksheet[z].v;
			//store header names
			if(row == 1) {
				headers[col] = value;
				continue;
			}
			if(!data[row]) data[row]={};
			data[row][headers[col]] = value;
		}
		//drop those first two rows which are empty
		data.shift();
	});
	return data;
}




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  MongoClient.connect("mongodb://localhost:27017/tracker", function(err, database) {
	  if(err) throw err;
	  db = database;
	  console.log("---DB Pools created---");
	});
});

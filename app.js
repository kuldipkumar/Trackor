/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , http = require('http')
  , path = require('path')
  , xlsx = require('node-xlsx')
  , fs = require("fs")
  , excel = require('xlsx')
  , db = require('mongodb').Db
  , mongoose = require('mongoose')
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
app.use(express.static(path.join(__dirname, 'views')));


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

mongoose.connect('mongodb://localhost/tracker');
var Resource = require('./model/Resource.js');
var Leave = require('./model/Leave.js');
var Ticket = require('./model/Ticket.js');
var Area = require('./model/Area.js');



app.get('/',function(req,res){
	res.sendfile('views/dashboard.html');
});

app.get('/',function(req,res){
	      res.sendFile(__dirname + "/tickets.html");
});


app.get('/show',function(req,res){
	res.sendfile('views/tickets.html');
});


app.get('/tickets', function(req,res){
	Ticket.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
	
});


app.get('/area', function(req,res){
	Area.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
	
});



app.get('/leaves', function(req,res){
	Leave.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
	
});

app.post('/saveLeave', function(req,res,data){
	
	var newentry = new Leave({
		  name: req.body.name,
		  leaveDate: req.body.leaveDate,
		  remark:req.body.remark,
		  type:req.body.type
		});
	
	newentry.save(function(err){
		if(err){
			throw err;
		}
		console.log("Leave Entry added sucessfully");
	});
	
	Leave.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
	
});

app.get('/resource', function(req,res){
	Resource.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
});

app.post('/saveResource', function(req,res,data){
	
	var newentry = new Resource({
		  name: req.body.name,
		  phonenumber: req.body.phonenumber,
		  ibmid:req.body.ibmid,
		  ibmEmailId:req.body.ibmEmailId,
		  hondaId:req.body.hondaId,
		  hondaEmailId:req.body.hondaEmailId,
		  location:req.body.location,
		  manager:req.body.manager,
		  role:req.body.role,
		  project:req.body.project,
		  password:req.body.password,
		  startDate:Date.now
		});
	
	newentry.save(function(err){
		if(err){
			throw err;
		}
		console.log("Entry added sucessfully");
	});
	
	Resource.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
	
});


app.post('/updateResource', function(req,res,data1){
	var data = new Resource({
		  name: req.body.name,
		  phonenumber: req.body.phonenumber,
		  ibmid:req.body.ibmid,
		  ibmEmailId:req.body.ibmEmailId,
		  hondaId:req.body.hondaId,
		  hondaEmailId:req.body.hondaEmailId,
		  location:req.body.location,
		  manager:req.body.manager,
		  role:req.body.role,
		  project:req.body.project,
		  password:req.body.password,
		  startDate:Date.now
		});
	
	Resource.findOneAndUpdate({ibmid:data.ibmid}, {name: data.name,phonenumber: data.phonenumber,ibmid:data.ibmid,ibmEmailId:data.ibmEmailId,hondaId:data.hondaId,hondaEmailId:data.hondaEmailId,
		  location:data.location,manager:data.manager,role:data.role,project:data.project, password:data.password}, function(err, resource) {
		  if (err){ 
			  throw err;
		  }
		});

	Resource.find(function(err, resources) {
		  if (err){
			  throw err;
		  }
		  return res.json(resources);
		});
	
});



app.post('/updateTicket', function(req,res){
	
	var data = req.body.updateData;
	if(null!=data){
		for(i=0;i<data.length;i++){
		var ticket = {
				_id: data[i].id,
				Remark:data[i].Remark,
				DeadLineDate: stringToDateObject(data[i].DeadLineDate),
				LstUpdatedOn: new Date()
			};
 			Ticket.findOneAndUpdate({ _id: ticket._id},{"Remark":ticket.Remark,"DeadLineDate":ticket.DeadLineDate,"LstUpdatedOn":ticket.LstUpdatedOn}, function(err, resource) {
 				  if (err){ 
 					  throw err;
 				  }
 				});
		}
	}
});

function stringToDateObject(stringDate){
	var date=Date.parse(stringDate);
	if (isNaN(date)==false){
		return new Date(date);
	}else{
		return null;
	}
}

function insertExcelData(data){
	var collection = db.collection('ticket');

    // Insert some users
    for (i=1; i<=data.length; i++){
		if(null!=data[i]){
			var type = '';
			var ticketNumber = data[i].Number;
			if(ticketNumber.startsWith("INC")){
				type = "Incident";
			}
			if(ticketNumber.startsWith("PRB")){
				type = "Problem";
			}
			if (ticketNumber.endsWith("Q")){
				type = "RequestNote";
			}
			if (ticketNumber.endsWith("P")){
				type = "InfoNotes-PR";
			}
			if (ticketNumber.endsWith("C")){
				type = "InfoNotes-CR";
			}

			var ticket = {
				_id: data[i].Number,
				Summary : data[i].Summary,
				Status : data[i].Status,
				Priority: data[i].Priority,
				AssignmentGrp: data[i].SubCategory,
				AssignedTo : data[i].AssignedTo,
				CreatedOn: excelToJSDate(data[i].Created),
				UpdatedOn: excelToJSDate(data[i].Updated),
				Done:'True',
				Remark:'',
				Type : type

			};
			var itemData = data[i];


			collection.update({ "_id": ticket._id},{"Summary": ticket.Summary,"Status":ticket.Status,"Priority":ticket.Priority,"AssignmentGrp":ticket.AssignmentGrp,
				"AssignedTo":ticket.AssignedTo,"CreatedOn":new Date(ticket.CreatedOn),"UpdatedOn":ticket.UpdatedOn,"Done":ticket.Done,"Remark":ticket.remark,"Type":ticket.Type} , { upsert: false } )

			collection.update({ "_id": ticket._id},{"Summary": ticket.Summary,"Status":ticket.Status,"Priority":ticket.Priority,"AssignmentGrp":ticket.AssignmentGrp,
				"AssignedTo":ticket.AssignedTo,"CreatedOn":new Date(ticket.CreatedOn),"UpdatedOn":ticket.UpdatedOn,"Done":ticket.Done,"Remark":ticket.remark,"Type":ticket.Type} , { upsert: true } )
		}
    }

}


function insertExcelDataByMongoose(data){

    // Insert some users
    for (i=1; i<=data.length; i++){
		if(null!=data[i]){
			var type = '';
			var ticketNumber = data[i].Number;
			if(ticketNumber.startsWith("INC")){
				type = "Incident";
			}
			if(ticketNumber.startsWith("PRB")){
				type = "Problem";
			}
			if (ticketNumber.endsWith("Q")){
				type = "RequestNote";
			}
			if (ticketNumber.endsWith("P")){
				type = "InfoNotes-PR";
			}
			if (ticketNumber.endsWith("C")){
				type = "InfoNotes-CR";
			}

			var ticket = new Ticket({
					Number			: data[i].Number,
					Summary			: data[i].Summary,
					Status			: data[i].Status,
					Priority		: data[i].Priority,
					AssignmentGrp	: data[i].SubCategory==null ?'': data[i].SubCategory,
					AssignedTo		: data[i].AssignedTo==null ?'': data[i].AssignedTo,
					Done			: 'True',
					Type			: type,
					CreatedOn		: excelToJSDate(data[i].Created),
					UpdatedOn		: excelToJSDate(data[i].Updated),
					Remark			: '',
					DeadLineDate	: null,
					LstUpdatedOn	: new Date()
				});		
			
			Ticket.update({Number: ticket.Number},{"Summary": ticket.Summary,"Status":ticket.Status,"Priority":ticket.Priority,"AssignmentGrp":ticket.AssignmentGrp,
				"AssignedTo":ticket.AssignedTo,"Done":ticket.Done,"Type":ticket.Type,"CreatedOn":ticket.CreatedOn,"UpdatedOn":ticket.UpdatedOn,
				"Remark":ticket.remark,"DeadLineDate":ticket.DeadLineDate,"LstUpdatedOn":ticket.LstUpdatedOn},{upsert:true} ,function(err, doc){
					if(err){
						throw err;
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

app.post('/upload',function(req,res){
    fs.readFile(req.files.uploadFile.path, function (err, data){ // readfile from the given path
        var dirname = path.resolve(".")+'/uploads/'; // path.resolve(“.”) get application directory path
        var newPath = dirname +   req.files.uploadFile.name; // add the file name
        fs.writeFile(newPath, data, function (err) { // write file in uploads folder
	        if(err){
	           res.json("Failed to upload your file");
	        }else {
	        	var data = readExcelData(newPath);
	        	var collection = db.collection('ticket');
	        	// Lets iterate on the result
	        	//collection.find().toArray(function(err, result) {
	        		//insertExcelData(data,result);
	        	insertExcelDataByMongoose(data);
	        	//});
	        	res.redirect('/show');
	        }
        });
    });

});

function excelToJSDate(excelDate){
	return new Date((excelDate - (25567 + 1))*86400*1000);
}


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
  MongoClient.connect("mongodb://localhost:27017/tracker", function(err, database) {
	  if(err) throw err;
	  db = database;
	  console.log("Press CTRL+C to stop.");
	});
});

/**
 * Module dependencies.
 */
var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path'),
    fs = require("fs"),
    excel = require('xlsx'),
	Cloudant = require('cloudant');

var app = express();


var me = 'kuldipkumar'; // Set this to your own account
var password = 'ravishankar';

// Initialize the library with my account.
var cloudant = Cloudant({account:me, password:password});

// all environments
var port = (process.env.VCAP_APP_PORT || 3001); 
var host = (process.env.VCAP_APP_HOST || 'localhost'); 



// all environments
app.set('port', port);
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

//Cloudant releated block
cloudant.db.list(function(err, allDbs) {
  console.log('All my databases: %s', allDbs.join(', '))
});

var db = cloudant.db.use('tracker');

app.get('/tickets', function(req, res) {
    db.find({selector:{DOCUMENTTYPE:'Ticket'}},function(err, resources) {
        if (err) {
            throw err;
        }
		return res.json(resources);
    });

});


app.get('/area', function(req, res) {
   db.find({selector:{DOCUMENTTYPE:'Area'}},function(err, resources) {
        if (err) {
            throw err;
        }
        return res.json(resources);
    });

});


app.get('/', function(req, res) {
    res.sendfile('views/dashboard.html');
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + "/tickets.html");
});


app.get('/show', function(req, res) {
    res.sendfile('views/tickets.html');
});


app.get('/resourceLeaves', function(req, res) {
    var resourceLeaves = [];
    db.find({selector:{DOCUMENTTYPE:'Resource'}} ,function(err, resources) {
        if (err) {
            throw err;
        }
        return res.json(resources);
    });
});


app.post('/resourceAndLocationLeave', function(req, res) {

    var data = req.body.updateData;
    var name = data[0];
    var location = data[1];
	console.log("Resource:"+name+" loc :"+location);
    var leaves = {};
	var query = { "selector": { "DOCUMENTTYPE":"Leave","name": {"$in": [name,location]}}, "sort": [ { "_id": "asc" } ] };
	db.find(query ,function(err, resources) {
        if (err) {
            throw err;
        }
        var personalLeave = [];
        var locationLeave = [];
		var resources = resources.docs;
        for (i = 0; i < resources.length; i++) {
			console.log(resources);
            if (resources[i].name == name) {
                personalLeave.push(resources[i].leaveDate);
            } else if (resources[i].name == location) {
                locationLeave.push(resources[i].leaveDate);
            }
        }
        var leave = {
            rname: name,
            pLeave: personalLeave,
            lLeave: locationLeave
        }
        return res.json(leave);

    });
});

app.post('/saveLeave', function(req, res, data) {
	var newentry = {
		DOCUMENTTYPE:'Leave',
        name: req.body.name,
        leaveDate: req.body.leaveDate,
        remark: req.body.remark,
        LstUpdatedOn: new Date()
    };

	db.insert(newentry, function (error, doc) {
		if(!error) {
			console.log("Leave Saved sucessfully:"  + newentry);
		} else {
			throw error;
		}
	});
	
	db.find({selector:{DOCUMENTTYPE:'Leave'}} ,function(err, resources) {
        if (err) {
            throw err;
        }
        return res.json(resources);
    });
});

app.get('/resource', function(req, res) {
    db.find({selector:{DOCUMENTTYPE:'Resource'}} ,function(err, resources) {
        if (err) {
            throw err;
        }
        return res.json(resources);
    });
});

app.post('/saveResource', function(req, res, data) {

    var newentry = {
		DOCUMENTTYPE:'Resource',
        name: req.body.name,
        phonenumber: req.body.phonenumber,
        ibmid: req.body.ibmid,
        ibmEmailId: req.body.ibmEmailId,
        hondaId: req.body.hondaId,
        hondaEmailId: req.body.hondaEmailId,
        location: req.body.location,
        manager: req.body.manager,
        role: req.body.role,
        project: req.body.project,
        password: req.body.password,
        startDate: new Date()
    };
	
	db.insert(newentry, function (error, doc) {
		if(!error) {
			console.log("Resource Saved sucessfully:"  + newentry);
		} else {
			throw error;
		}
	});

	db.find({selector:{DOCUMENTTYPE:'Resource'}} ,function(err, resources) {
        if (err) {
            throw err;
        }
        return res.json(resources);
    });

});


app.post('/updateResource', function(req, res, data1) {
    
	db.find({selector:{DOCUMENTTYPE:'Resource',ibmid: req.body.ibmid}},function(err, allDocs) {
			//insert if ticket is new
		if( (allDocs!=null) || (allDocs.docs.length>0) ){
			var updatedRecord = allDocs.docs[0];
			updatedRecord.name 			= req.body.name;
			updatedRecord.phonenumber 	= req.body.phonenumber;
			updatedRecord.location 		= req.body.location;
			updatedRecord.manager 		= req.body.manager;
			updatedRecord.role 			= req.body.role;
			updatedRecord.project 		= req.body.project;
			updatedRecord.password 		= req.body.password;
			updatedRecord.startDate 	= new Date();				
			db.insert(updatedRecord,allDocs._id, function (error, doc) {
				if(!error) {
					console.log("Resource updated sucessfully:"  + updatedRecord);
				} else {
					throw error;
				}
			});
		}
	});
	
	db.find({selector:{DOCUMENTTYPE:'Resource'}} ,function(err, resources) {
        if (err) {
            throw err;
        }
        return res.json(resources);
    });

});

app.get('/showLeaves', function(req, res) {
    return true;
});

app.post('/updateTicket', function(req, res) {

    var data = req.body.updateData;
	//console.log("Form Data:" + JSON.stringify(data))
    if (null != data) {
		for (i = 0; i < data.length; i++) {
			console.log("inside caller : "  + i )
			updateTickets(data[i]);
        }
    }
});

function  updateTickets(data){
	db.find({selector:{DOCUMENTTYPE:'Ticket',_id: data.id}},function(err, allDocs) {
		if( (allDocs!=null) && (allDocs.docs.length>0) ){
			var updatedRecord = allDocs.docs[0];
			console.log("i: " + i+" " + allDocs.docs.length);
			updatedRecord.Remark 		= data.Remark;
			updatedRecord.DeadLineDate 	= stringToDateObject(data.DeadLineDate);
			updatedRecord.LstUpdatedOn 	= new Date();	
			db.insert(updatedRecord,updatedRecord._id, function (error, doc) {
				if(!error) {
					console.log("Ticket updated sucessfully:"  + JSON.stringify(updatedRecord));
				} else {
					throw error;
				}
			});
		}	
	});
}


function readExcelData(newPath) {
    var workbook = excel.readFile(newPath);
    var data = [];
    var sheet_name_list = workbook.SheetNames;
    sheet_name_list.forEach(function(y) {
        var worksheet = workbook.Sheets[y];
		var headers = {};
        for (z in worksheet) {
            if (z[0] === '!') continue;
            var col = z.substring(0, 1);
            var row = parseInt(z.substring(1));
            var value = worksheet[z].v;
            //store header names
			if (row == 1) {
				if(col=='A'){
					value = 'Number';
				}else if(col=='B'){
					value = 'Summary';
				}else if(col=='C'){
					value = 'Status';
				}else if(col=='D'){
					value = 'Priority';
				}else if(col=='E'){
					value = 'AssignmentGrp';
				}else if(col=='F'){
					value = 'AssignedTo';
				}else if(col=='G'){
					value = 'CreatedOn';
				}else if(col=='H'){
					value = 'UpdatedOn';
				}
                headers[col] = value;
                continue;
            }
			//console.log(headers[col]);
            if (!data[row]) data[row] = {};
            data[row][headers[col]] = value;
        }
        //drop those first two rows which are empty
        data.shift();
    });
    return data;
}

app.post('/upload', function(req, res) {
    fs.readFile(req.files.uploadFile.path, function(err, data) { // readfile from the given path
        var dirname = path.resolve(".") + '/uploads/'; // path.resolve(“.”) get application directory path
        var newPath = dirname + req.files.uploadFile.name; // add the file name
        fs.writeFile(newPath, data, function(err) { // write file in uploads folder
            if (err) {
                res.json("Failed to upload your file");
            } else {
                var data = readExcelData(newPath);
                var ticketData = prepareInsertData(data);
				insertExcelDataByCloudant(ticketData);
                //});
                res.redirect('/show');
            }
        });
    });

});


function insertExcelDataByCloudant(ticketData) {
    for (i = 0; i < ticketData.length; i++) {
      insertOrUpdate(ticketData[i]);
    }
}

function insertOrUpdate(record){
    if(null!=record && null!=record.Number){
		db.find({selector:{_id:record.Number}},function(err, allDocs) {
			//insert if ticket is new
			if( (allDocs==null) || (allDocs.docs.length==0) ){
				db.insert(record, function (error, doc) {
	                if(!error) {
	                    console.log("Ticket inserted sucessfully:"  + record);
	                } else {
	                	throw error;
	                }
	            });
			}else{
				var updatedRecord = allDocs.docs[0];
				updatedRecord.Summary = record.Summary;
				updatedRecord.Status = record.Status;
				updatedRecord.Priority = record.Priority;
				updatedRecord.AssignmentGrp = record.AssignmentGrp;
				updatedRecord.AssignedTo = record.AssignedTo;
				updatedRecord.UpdatedOn = record.UpdatedOn;
				updatedRecord.Done = record.Done;
				updatedRecord.LstUpdatedOn = record.LstUpdatedOn;	
				db.insert(updatedRecord,record._id, function (error, doc) {
	                if(!error) {
	                    console.log("Ticket updated sucessfully:"  + record);
	                } else {
	                	throw error;
	                }
	            });
			}
		});
	}
}

function prepareInsertData(data){
    var recordData = [];
     for (i = 0; i < data.length; i++) {
        if (null != data[i]) {
            var type = '';
            var ticketNumber = data[i].Number;
            if (ticketNumber.startsWith("INC")) {
                type = "Incident";
            }
            if (ticketNumber.startsWith("PRB")) {
                type = "Problem";
            }
            if (ticketNumber.endsWith("Q")) {
                type = "RequestNote";
            }
            if (ticketNumber.endsWith("P")) {
                type = "InfoNotes-PR";
            }
            if (ticketNumber.endsWith("C")) {
                type = "InfoNotes-CR";
            }

            data[i]._id = data[i].Number;
            data[i].AssignmentGrp = data[i].AssignmentGrp == null ? '' : data[i].AssignmentGrp;
            data[i].AssignedTo = data[i].AssignedTo == null ? '' : data[i].AssignedTo;
            data[i].Done = 'True';
            data[i].Type = type;
            data[i].CreatedOn = excelToJSDate(data[i].CreatedOn);
            data[i].UpdatedOn = excelToJSDate(data[i].UpdatedOn);
            data[i].Remark = '';
            data[i].DeadLineDate = null;
            data[i].DOCUMENTTYPE = 'Ticket'; 
            data[i].LstUpdatedOn= new Date()
        }
        recordData.push(data[i]);
    }
    return recordData;
 }   

//Util functions
function stringToDateObject(stringDate) {
    var date = Date.parse(stringDate);
    if (isNaN(date) == false) {
        return new Date(date);
    } else {
        return null;
    }
}

function excelToJSDate(excelDate) {
    return new Date((excelDate - (25567 + 1)) * 86400 * 1000);
}


http.createServer(app).listen(app.get('port'), function() {
    console.log('Express server listening on '+host+' port:' + app.get('port'));
    console.log("Press CTRL+C to stop.");
});

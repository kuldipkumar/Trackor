mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ticketSchema = new Schema({
	  Number: 		{type: String, required: true, unique: true},
	  Summary: 		{type: String, required: true},
	  Status: 		{type: String, required: true},
	  Priority: 	{type: String},
	  AssignmentGrp:{type: String},
	  AssignedTo: 	{type: String},
	  Done: 		{type: String},
	  Type:			{type: String},
	  CreatedOn: 	{type: Date},
	  UpdatedOn: 	{type: Date},
	  Remark: 		{type: String},
	  DeadLineDate: {type: Date},
	  LstUpdatedOn:	{type: Date}
	});

var Ticket = mongoose.model('Ticket', ticketSchema);
module.exports = Ticket;
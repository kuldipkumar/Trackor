mongoose = require('mongoose');
var Schema = mongoose.Schema;

var leaveSchema = new Schema({
	  name: String,
	  leaveDate: {type: String, required: true},
	  remark: { type: String},
	  type: { type: String}
	});

var Leave = mongoose.model('Leave', leaveSchema);
module.exports = Leave;
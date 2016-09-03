mongoose = require('mongoose');
var Schema = mongoose.Schema;

var areaSchema = new Schema({
	AssignmentGrp: {type: String, required: true, unique: true},
	Area: {type: String, required: true}
	});

var Area = mongoose.model('Area', areaSchema);
module.exports = Area;
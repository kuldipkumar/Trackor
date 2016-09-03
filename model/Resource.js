mongoose = require('mongoose');
var Schema = mongoose.Schema;

var resourceSchema = new Schema({
	  name: String,
	  phonenumber: { type: String, required: true, unique: true },
	  ibmid: { type: String, required: true, unique: true },
	  ibmEmailId: { type: String, required: true, unique: true },
	  hondaId: { type: String, unique: true },
	  hondaEmailId: { type: String, unique: true },
	  location: { type: String, required: true, unique: false },
	  manager: { type: String, required: true, unique: false },
	  role: { type: String, required: true, unique: false },
	  project: { type: String, required: true, unique: false },
	  password: { type: String, required: true }
	});

var Resource = mongoose.model('Resource', resourceSchema);
module.exports = Resource;
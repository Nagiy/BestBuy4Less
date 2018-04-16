var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var CategorySchema = new Schema({
  id: String,
  name: String,
  parentCategory: String,
  hasSubcategories: Boolean
}, {
    versionKey: false // Disable _v
  });

module.exports = mongoose.model('Category', CategorySchema);
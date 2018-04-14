var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	name: String,
	sku: { type: String /*, index: { unique: true } */ },
	categoryName: String,
	regularPrice: Number,
	salePrice: Number,
	thumbnailImage: String

});

//ProductSchema.index({ sku: 1 });

module.exports = mongoose.model('Product', ProductSchema);
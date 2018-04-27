var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var ProductSchema = new Schema({
	sku: { type: String/*, index: { unique: true }*/ },
	name: String,
	shortDescription: String,
	productUrl: String,
	customerRating: Number,
	customerRatingCount: Number,
	customerReviewCount: Number,
	hasPromotion: Boolean,
	isClearance: Boolean,
	isInStoreOnly: Boolean,
	isOnlineOnly: Boolean,
	isPreorderable: Boolean,
	isVisible: Boolean,
	isFrenchCompliant: Boolean,
	categoryName: String,
	regularPrice: Number,
	salePrice: Number,
	ehf: Number,
	saleEndDate: Date,
	thumbnailImage: String,
	currentRegion: String,
	lastUpdateTime: { type: Date, default: Date.now }
}, {
		versionKey: false // Disable _v
	});

module.exports = mongoose.model('Product', ProductSchema);
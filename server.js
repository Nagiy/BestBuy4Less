// BASE SETUP
// =============================================================================

// call the packages we need
var express = require('express');
var compression = require('compression')
var bodyParser = require('body-parser');
var app = express();
var setup = require('./app/setup');
var morgan = require('morgan');

// configure app
app.use(morgan('dev')); // log requests to the console

// configure body parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

var port = process.env.PORT || 8080; // set our port

// compress all responses
app.use(compression());

// ROUTES FOR OUR API
// =============================================================================

// create our router
var router = express.Router();
/*
// middleware to use for all requests
router.use(function (req, res, next) {
	// do logging
	var oldWrite = res.write,
		oldEnd = res.end;

	var chunks = [];

	res.write = function (chunk) {
		chunks.push(chunk);

		oldWrite.apply(res, arguments);
	};

	res.end = function (chunk) {
		if (chunk)
			chunks.push(chunk);

		var body = Buffer.concat(chunks).toString('utf8');
		console.log(req.path, body);

		oldEnd.apply(res, arguments);
	};

	//console.log(`${res.output}`);
	next();
});
*/
// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function (req, res) {
	res.json({ message: 'hooray! welcome to our api!' });
});

// on routes that end in /products
// ----------------------------------------------------
router.route('/products')
	/*
		// create a product (accessed at POST http://localhost:8080/products)
		.post(function (req, res) {
	
			var product = new Product();		// create a new instance of the Product model
			product.name = req.body.name;  // set the products name (comes from the request)
	
			product.save(function (err, product) {
				if (err)
					res.send(err);
	
				res.json({ message: 'Product created!' });
			});
		})
	*/
	// get all the products (accessed at GET http://localhost:8080/api/products)
	.get(function (req, res) {
		let limit = Number(req.query.$top) || 0, count = 652493;
		let skip = Number(req.query.$skip) || 0;
		if (!limit) {
			res.json({
				count: count,
				value: []
			});
			return;
		}
		setup.getProducts(skip, limit, function (err, products) {
			if (err)
				res.send(err);

			let result = {
				count: count,
				value: products
			}

			res.json(result);
		});
	});
/*
// on routes that end in /products/:product_id
// ----------------------------------------------------
router.route('/products/:product_id')

	// get the product with that id
	.get(function (req, res) {
		Product.findById(req.params.product_id, function (err, product) {
			if (err)
				res.send(err);
			res.json(product);
		});
	})

	// update the product with this id
	.put(function (req, res) {
		Product.findById(req.params.product_id, function (err, product) {

			if (err)
				res.send(err);

			product.name = req.body.name;
			product.save(function (err, product) {
				if (err)
					res.send(err);

				res.json({ message: 'Product updated!' });
			});

		});
	})

	// delete the product with this id
	.delete(function (req, res) {
		Product.remove({
			_id: req.params.product_id
		}, function (err, product) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	});
*/

// REGISTER OUR ROUTES -------------------------------

app.use(express.static(__dirname + '/public'));
app.use('/api', router);

// START THE SERVER
// =============================================================================
app.listen(port);
console.log('Magic happens on port ' + port);

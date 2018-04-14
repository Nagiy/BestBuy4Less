var request = require('request');
var Product = require('./models/product');

// Initial DB Setup
// =============================================================================

getData = function (url) {
  // Setting URL and headers for request
  var options = {
    url: url,
    headers: {
      //'User-Agent': 'request'
    }
  };
  // Return new promise 
  return new Promise(function (resolve, reject) {
    // Do async job
    request.get(options, function (err, resp, body) {
      if (err) {
        reject(err);
      } else {
        resolve(JSON.parse(body));
      }
    })
  })
}
/*
module.exports.getCategories = function (category) {
	https.get("https://api1.bestbuy.ca/v2/json/category/", res => {
		let body = "";
		res.on("data", data => {
			body += data;
		});
		res.on("end", () => {
			let obj = JSON.parse(body);
			res.writeHead(200, { 'Content-Type': 'application/json' });
			for (var subcat of obj.subCategories) {
				res.write(JSON.stringify(subcat));
			}
			res.write(body);
			res.end();
		});
	});
}
*/

initProducts = function (categoryid, page) {
  url = `https://api1.bestbuy.ca/v2/json/search?categoryid=${categoryid}&page=${page}&pageSize=100`;
  getData(url).then(function (data) {
    if (data.products && data.products.length > 0) {
      Product.insertMany(data.products)
        .then((docs, err) => {
          if (err) {
            console.log(err);
          } else {
            console.log(page);
            setTimeout(() => initProducts(categoryid, ++page), 1000);
          }
        })
        .catch(e => {
          console.log(e.message);
        });
    } else {
      console.log(`Finished category ${categoryid}`);
    }
  }, err => {
    console.log(err);
    console.log("Retrying in 30 seconds...");
    // retry after 30 secs
    setTimeout(() => initProducts(categoryid, page), 30000);
  });
}

module.exports.initProductsFromBestBuy = function () {
  url = `https://api1.bestbuy.ca/v2/json/category/`
  getData(url).then(function (data) {
    for (category of data.subCategories) {
      console.log(`Processing category ${categoryid}`);
      initProducts(category.id, 1);
      console.log(`All Done!`);
    }
  }, err => console.log(err));
}

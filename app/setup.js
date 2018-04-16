// DATABASE SETUP
var mongoose = require('mongoose');
//mongoose.connect('mongodb://survivor:Letmein2@ds149144.mlab.com:49144/survivor_db', { autoIndex: false }); // connect to remote database
mongoose.connect('mongodb://localhost:27017/bestbuy', { autoIndex: false }); // connect to local database

// Handle the connection event
var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));

db.once('open', function () {
  console.log("DB connection alive");
  //initProductsFromBestBuy();
  removeDuplicates();
});

var request = require('request');
var Product = require('./models/product');
var Category = require('./models/category');

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

initCategories = function (parentCategory = "") {
  console.log(parentCategory);
  url = `https://api1.bestbuy.ca/v2/json/category/${parentCategory}`;
  getData(url).then(function (data) {
    if (data && data.subCategories) {
      for (category of data.subCategories) {
        category.parentCategory = parentCategory;
        Category.insertMany(category)
          .then((docs, err) => {
            if (err) {
              console.log(err);
            } else {
              if (docs[0].hasSubcategories) {
                initCategories(docs[0].id);
              }
            }
          })
          .catch(e => {
            console.log(e.message);
          });
      }
    }
  }, err => console.log(err));
}

initProducts = function (categories, index, page) {
  categoryid = categories[index].id;
  url = `https://api1.bestbuy.ca/v2/json/search?categoryid=${categoryid}&page=${page}&pageSize=100`;
  getData(url).then(function (data) {
    if (data.products && data.products.length > 0) {
      Product.insertMany(data.products)
        .then((docs, err) => {
          if (err) {
            console.log(err);
          } else {
            console.log(page);
            setTimeout(() => initProducts(categories, index, ++page), 1000);
          }
        })
        .catch(e => {
          console.log(e.message);
        });
    } else {
      console.log(`Finished category ${categoryid}`);
      // Process next category
      index++;
      if (index < categories.length) {
        console.log(`Processing category ${categories[index].id}`);
        setTimeout(() => initProducts(categories, index, 1), 100);
      } else {
        console.log(`Processing Complete!`);
      }
    }
  }, err => {
    console.log(err);
    console.log("Retrying in 30 seconds...");
    // retry after 30 secs
    setTimeout(() => initProducts(categories, index, page), 30000);
  });
}

initProductsFromBestBuy = function () {
  Category.find({ hasSubcategories: false })
    .then(function (docs, err) {
      if (err) {
        console.log(err);
      } else {
        console.log(`Processing category ${docs[0].id}`);
        initProducts(docs, 0, 1);
      }
    });
  /*
url = `https://api1.bestbuy.ca/v2/json/category/`
getData(url).then(function (data) {
  if (data && data.subCategories && data.subCategories.length > 0) {
    console.log(`Processing category ${data.subCategories[0].id}`);
    initProducts(data.subCategories, 0, 1);
  }
}, err => console.log(err));*/
}

removeDuplicates = function () {
  Product.aggregate([{
    $group: { _id: "$sku", uniqueIds: { $addToSet: "$_id" }, count: { $sum: 1 } }
  }, {
    $match: { count: { "$gt": 1 } }
  }]).option({ allowDiskUse: true }).exec(
    function (err, result) {
      if (err) {
        console.log(err);
        return;
      }
      dups = result.map(function (el) {
        return el.uniqueIds[0];
      });
      Product.deleteMany({ _id: { $in: dups } })
        .then(function (docs, err) {
          if (err) {
            console.log(err);
          } else {
            console.log(`Successfully deleted all duplicates`);
          }
        });
    });
}

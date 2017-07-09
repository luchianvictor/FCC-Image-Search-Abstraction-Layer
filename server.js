// server.js
// where your node app starts

// init project
const express = require('express');
const google = require("googleapis");
const cs = google.customsearch("v1");
const mongo = require('mongodb').MongoClient;
var app = express();


let queries = [];
//connecting to the mongo database
mongo.connect(process.env.BASE, function(err, db) {
              if (err) throw err;
              queries = db.collection("queries");
              // console.log(queries);
              });


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});



app.get("/api/latest/imagesearch", (req, res) => {
  queries.find().toArray(function(err,docs) {
    if (err) throw err;
    res.json(docs);
  });
})

app.get("/api/imagesearch/:q", (req, res) => {
  let q = req.params.q || "";
  let offset = req.query.offset || 0;
  queries.insert({
    term: q,
    when: new Date()
  });

  getResults(q, offset, (result) => {
    res.json(result);
  });
});




// listen for requests :)
var listener = app.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

// more info https://developers.google.com/custom-search/json-api/v1/reference/cse/list
function getResults(q, offset, callback){

  cs.cse.list({
    auth: process.env.API_KEY,
    cx: process.env.engineID,
    q: q,
    searchType: "image",
    start: ++offset
  }, (err, result) => {
    if(err) console.log(err);
    result = result.items;
    
    let filtered = [];
    for(let i in result){
          let filter;
      filter = {
        url: result[i].link,
        snippet: result[i].snippet,
        context: result[i].image.contextLink
      }
      filtered.push(filter);
    }
    //invoking res.json with filtered answers
    callback(filtered);
  });
}
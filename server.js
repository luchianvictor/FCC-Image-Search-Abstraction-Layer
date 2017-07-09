// server.js
// where your node app starts

// init project
var express = require('express');
const google = require("googleapis");
const cs = google.customsearch("v1");
// const url = require("url");
var app = express();

// we've started you off with Express, 
// but feel free to use whatever libs or frameworks you'd like through `package.json`.


// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));

// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (request, response) {
  response.sendFile(__dirname + '/views/index.html');
});


let latest = [];

app.get("/api/latest/imagesearch", (req, res) => {
  let show = [];
  let endLength = (latest.length-10 < 0) ? 0 : latest.length-10;
  for(let i = latest.length-1; i > endLength-1; i--){
    show.push(latest[i]);
  }
  res.json(show);
})

app.get("/api/imagesearch/:q", (req, res) => {
  let q = req.params.q || "";
  let offset = req.query.offset || 0;
  latest.push({
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
    console.log(result);
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
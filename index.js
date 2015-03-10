
var http = require('http')
var https = require('https')
var url = require('url')
var qs = require('querystring')

var levelup = require('levelup')
var sublevel = require('level-sublevel')
var request = require('request')
var JSONStream = require('JSONStream')
var next = require('next-stream')
var through = require('through2')

levelup('./tweets.db', function(err, basedb) {
  
  if(err) throw err;
  
  db = sublevel(basedb)
  var track = db.sublevel('track')
  var tweets = db.sublevel('tweets')
  

  // fetch the twitter count for the given url and store it
  function fetch(earl, cb) {
    request({
      url: 'https://cdn.api.twitter.com/1/urls/count.json',
      qs: { url: earl },
      json: true
    }, function(error, res, body) {
      if(error) console.error(error)
      else tweets.sublevel(earl).put((new Date()).toString(), body.count, function(err) {
        if(err) console.error(err)
      })
    })
  }
  
  var server = http.createServer(function(req, res) {
    
    // GET /fetch
    // trigger fetching & storing twitter counts for all the URLs we're
    // currently tracking
    if(/^\/fetch/.test(req.url)) {
      track.createKeyStream()
        .on('data', function(url) {
          res.write((new Date()).toString() + ' Fetching count for '+url+'\n')
          fetch(url);
        })
        .on('error', function(err) { reportError(res, err) })
        .on('end', function() { res.end() })
    }
    
    // GET /count?url=...
    // return all twitter counts for the requested URL
    else if(/^\/count/.test(req.url)) {
      var args = qs.parse(url.parse(req.url).query)

      // Check if we're tracking this URL or not
      track.get(args.url, function (err, value) {
        // If not, add it to list of tracked URL and start an initial fetch
        if (err && err.notFound) {
          var now = (new Date()).toString()
          track.put(args.url, now, function(err, value) {
            if(err) reportError(res, err)
            else {
              fetch(args.url)
              res.end(JSON.stringify({
                url: args.url,
                since: now,
                counts: []
              }))
            }
          })
        }
        else if (err) reportError(res, err)
        // If so, return all the counts we've recorded for it.
        else {
          next([
            '{',
            '  "url":   "' + args.url + '",',
            '  "since": "' + value +    '",',
            '  "counts": ',
            tweets.sublevel(args.url) // pull from db
              .createReadStream() 
              .pipe(through.obj(function(data, enc, cb) { // meaningful schema
                cb(null, {date: data.key, count: data.value})
              }))
              .pipe(JSONStream.stringify()) // wrap up in JSON array
              .pipe(through()), // workaround: JSONStream returns a stream that's missing some methods needed for duck typing
            '}\n'
          ], {open: false})
          .pipe(res)
        }
      })
    }
  })

  
  var port = process.env.PORT || Number(process.argv[2]) || 3000;
  server.listen(port, function() {
    console.log('tweets-over-time:', 'listening on ',port)
  })
  
})


function reportError(res, err) {
  res.end('There was an error: ' + err)
  console.error(err)
}

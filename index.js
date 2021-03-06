"use strict"

var express = require('express')
var request = require('request')
var bodyParser = require('body-parser')
var stream = require("stream")
var app = express();
var baseURL = "https://integram.org/webhook/"

app.set('port', (process.env.PORT || 5000))
app.use(express.static(__dirname + '/public'))

app.get('/', function (request, response) {
  response.send('OK')
})


var request_to_horn = function (id, res) {
  var url = `${baseURL}${id}`;
  return request.post({ url: url }, function (error, response, body) {
    res.statusCode = error ? 500 : 200;
    res.send(body)
  })

};
app.post('/direct/:id', function (req, res) {
  var id = req.params.id;
  req.pipe(request_to_horn(id, res));
})

var textRawParser = bodyParser.text();

app.post('/test-horn/:id', textRawParser, function (req, res) {
  var id = req.params.id;
  var url = `${baseURL}${id}`;
  var raw = req.body;
  var post_json = JSON.stringify({ text: raw });
  var stream = require("stream")
  var a = new stream.PassThrough()
  a.write(post_json)

  a.pipe(request_to_horn(id, res))
  a.end()
})

app.post('/horn/:id', bodyParser.json(), function (req, res) {
  console.log(req.params)
  var id = req.params.id;
  var url = `${baseURL}${id}`;
  var json = req.body;
  console.log(json)
  let content = `*${json.project}* \`${json.level.toUpperCase()}\`
${json.event.title}
${json.url.replace('?referrer=webhooks_plugin', '')}`
  var post_json = JSON.stringify({ text: content });
  console.log(post_json);
  var a = new stream.PassThrough()
  a.write(post_json)
  a.pipe(request_to_horn(id, res))
  a.end()
})


app.listen(app.get('port'), function () {
  console.log("Node app is running at localhost:" + app.get('port'))
})
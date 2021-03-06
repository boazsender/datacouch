var request = require('request')
  , couchapp = require('couchapp')
  , deferred = require('deferred')
  , http = require('http')
  , path = require('path')
  , _ = require('underscore')
  ;

var couch = process.argv[2]
  , db = couch + "/datacouch"
  , h = {"Content-type": "application/json", "Accept": "application/json"}
  ;

function absolutePath(pathname) {
  if (pathname[0] === '/') return pathname
  return path.join(process.env.PWD, path.normalize(pathname));
}

function pushCouchapp(app, target) {
  var dfd = deferred();
  couchapp.createApp(require(absolutePath(app)), target, function (app) { app.push(function(resp) { dfd.resolve() }) })
  return dfd.promise();
}

function get(uri) {
  var dfd = deferred();
  request({uri: uri, headers: h}, function (err, resp, body) {
    dfd.resolve(JSON.parse(body).rows);
  })
  return dfd.promise();
}

get(db + "/_design/datacouch/_view/by_date").then(function(datasets) {
  _.each(datasets, function(dataset) {
    console.log(dataset)
    pushCouchapp("../db.js", couch + "/" + dataset.id).then(function() {
      console.log('updated ' + dataset.id);
    });
  })
})
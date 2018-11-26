const express = require('express');
const fs = require('fs');
let expressMetrics = require('express-metrics');
let dateFormat = require('dateformat');
let mongo = require('./mongo-db-requests');
let MongoClient = require('mongodb').MongoClient;

let app = express();
let settings = JSON.parse(fs.readFileSync('config.json'));

let collPromise = MongoClient.connect(settings.mongo_db)
  .then((client) => client.db('Downloads'))
  .then( (db) => db.collection("Downloads") );

app.use(expressMetrics({
    port: 8091
}));

app.post('/downloads/*/*/*', (req, res) => {
    let artifact = getArtifact(req.params);
    let artifactNoVer = {
        group: artifact.group,
        name: artifact.name,
        date: artifact.date
    };

    collPromise.then((coll) =>
          mongo.logJSSONtoDB(artifact, coll)
                .then((res) => mongo.logJSSONtoDB(artifactNoVer, coll))
    ).catch((err) => console.log(err))

    res.send();
});

app.get('/downloads/*/*/*', (req, res) => {
    let artifact = getArtifact(req.params)
    sendStats(res, artifact);
});

app.get('/downloads/*/*', (req, res) => {
    let artifact = getArtifact(req.params)
    sendStats(res, artifact);
});

function sendStats(res, artifact) {
    console.log("getting stats", artifact)

    collPromise.then((coll) => {
        mongo.getWeeklyMonthlyStatistics(artifact, coll).then((counts) => {
            console.log("sending", counts)
            res.send(counts);
        });
    }).catch((err) => {
        console.log(err)
        res.send("{}")
    })
}

// com.github.user/repo/version
function getArtifact(params) {
  var group = params[0];
  var name = params[1];
  var version = params[2];
  var now = new Date();
  
  const artifact = {
    group: group,
    name: name,
    version: version,
    date: dateFormat(now, 'yyyymmdd')
  }

  return artifact;
}

app.listen(settings.port, ()=>{
  console.log(`Server is up and listening on the port ${settings.port}`);
  collPromise.then((db) => console.log("Connected to db"));
});
module.exports = {

}
const express = require('express');
const request = require('request');
const fs = require('fs');
var app = express();
var dateFormat = require('dateformat');
var mongo = require('./mongo-update');

/*
  request looks like this:
  com/github/user/proj/1.0/proj-1.0.pom
  outgoing response should be like
  {"group": "com.github.user", "artifact": "proj", "version": "1.0", "date": "20181003"}
*/

MongoClient = require('mongodb').MongoClient;

let collPromise = MongoClient.connect(readSetting('mongo_db'))
  .then((client) => client.db('Downloads'))
  .then( (db) => db.collection("Downloads") )

app.get('/*.pom', (req, res) =>{

  var param_string = req.params[0];
  var artifact = getArtifact(param_string);
  collPromise.then((coll) => {
      mongo.logJSSONtoDB(artifact, coll);
      }
    )
  res.send("Done");
  }
);


function readSetting (setting) {
  try{
    var notesString = fs.readFileSync('config.json');
    var jsonString = JSON.parse(notesString);
    
    if (setting =='port'){
      return jsonString.port;

    }else if (setting == 'post_req_url'){
      return jsonString.post_req_url;
    }else if (setting == 'mongo_db') {
      return jsonString.mongo_db;
    }
  }catch(e){
    console.log(e);
  }
  return '';
}

function getArtifact(param_string) {
  var array_of_vals = param_string.split('/')
  var group = `${array_of_vals[0]}.${array_of_vals[1]}.${array_of_vals[2]}`;
  var name = array_of_vals[3];
  var version = array_of_vals[4];
  var now = new Date();
  
  const artifact = {
    group: group,
    name: name,
    version: version,
    date: dateFormat(now, 'yyyymmdd')
  }

  return artifact;
}

app.listen(readSetting('port'), ()=>{
  console.log(`Server is up and listening on the port ${readSetting('port')}`);
});
module.exports = {
  readSetting
}
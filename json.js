const express = require('express');
const request = require('request');
const fs = require('fs');
var app = express();
var dateFormat = require('dateformat');
var mongo = require('./mongo-update');

/*
  request looks like this:
  com/github/jitpack/proj/1.0/proj-1.0.pom
  outgoing response should be like
  {"group": "com.github.jitpack", "artifact": "proj", "version": "1.0", "date": "20181003"}
*/
console.log(readSetting);
MongoClient = require('mongodb').MongoClient;


let clientPromise = MongoClient.connect(readSetting('mongo_db'));


app.get('/*.pom', (req, res) =>{

  var param_string = req.params[0];
  var jsonobj = getJson(param_string);
  clientPromise
    .then((client) => {
      let db = client.db('Downloads');
      mongo.logJSSONtoDB(jsonobj, db);
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
      console.log('json request port ' , jsonString.port);
    }else if (setting == 'post_req_url'){
      console.log('json post request url ' , jsonString.post_req_url);
      return jsonString.post_req_url;
    }else if (setting == 'mongo_db') {
      console.log('json mongo_db url ' , jsonString.mongo_db);
      return jsonString.mongo_db;
    }
  }catch(e){
    console.log(e);
  }
  return '';
}

var getJson = (param_string) => {
  var array_of_vals = param_string.split('/')
  console.log(array_of_vals);
  var group = `${array_of_vals[2]}.${array_of_vals[1]}.${array_of_vals[0]}`;
  var artifact = array_of_vals[3];
  var version = array_of_vals[4];
  var now = new Date();
  console.log('group ', group, 'artifact ', artifact, 'version ', version, 'date ' , dateFormat(now, 'yyyymmdd'));

  const jsonobj = {
    group: group,
    artifact: artifact,
    version: version,
    date: dateFormat(now, 'yyyymmdd')
  }
  //console.log(jsonobj);
  return jsonobj;
}



app.listen(readSetting('port'), ()=>{
  console.log(`Server is up and listening on the port ${readSetting('port')}`);
});
module.exports = {
  readSetting
}
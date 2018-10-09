const express = require('express');
const request = require('request');
const fs = require('fs');
var app = express();
var dateFormat = require('dateformat');

/*
  request looks like this:
  com/github/jitpack/proj/1.0/proj-1.0.pom
  outgoing response should be like
  {"group": "com.github.jitpack", "artifact": "proj", "version": "1.0", "date": "20181003"}
*/
app.get('/*.pom', (req, res) =>{

  var param_string = req.params[0];
  var jsonobj = getJson(param_string);

  var data = {
      //method: 'POST',
      url: readSetting('post_req_url'),
      headers: {
          'Content-Type': 'application/json'
      },
      json:true,
      body: jsonobj

  };

  request.post(data, function(err, resp, body){
    if (err){
      console.log(err);
      res.send('error');
    }else{
      console.log(data);
      console.log(body);
      res.send('fine');
    }
  });
});


var readSetting = (setting) => {
  try{
    var notesString = fs.readFileSync('config.json');
    var jsonString = JSON.parse(notesString);
    if (setting =='port'){
      return jsonString.port;
    }else if (setting == 'post_req_url'){
      console.log('json post request url ' , jsonString.port);
      return jsonString.post_req_url;
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
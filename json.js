const express = require('express');
var app = express();
var port = 3000;
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
  res.send(jsonobj);
});

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
  console.log(jsonobj);
  return jsonobj;
}
app.get('/users/:userId/books/:bookId', function (req, res) {
  res.send(req.params)
})

app.listen(port, ()=>{
  console.log(`Server is up and listening on the port ${port}`);
});

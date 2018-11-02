/* a service that increments download count
 in a new collection
 collection ‘downloads’ i.e. 
 _id = com.github.user/repo
 contents: {“YYYYMMDD”: 123}
 where 123 is download count in that day
 each document in collection downloads: 
{"_id": "com.github....",
  "downloads": {
      "20180311": 123,
      "20180312": 100,
      ....
    }
}*/

function logJSONtoDB(artifact, collection) {
    var id = artifact.group  + ":" + artifact.name;
    var date = artifact.date;
    var key = 'downloads.' +[date];
    
    collection.updateOne(                 
        {   
            _id: id 
        },
        { 
            $inc: { 
                [key]: + 1 
            } 
        },
        {
            returnOriginal: false,
            upsert: true
        }
    ).then((res) => {
    }).catch((error) =>{
        console.log('Error from the increment', error);
    });       
}
module.exports.logJSSONtoDB = logJSONtoDB;
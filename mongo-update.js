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


var logJSONtoDB = (jsonObj, mongo_db) => {
    var id_group = jsonObj.group;
    var date = jsonObj.date;
    var collection = mongo_db.collection("Downloads");
    var key = 'downloads.' +[date];
    collection.findOneAndUpdate(                 
        {   
            _id: id_group
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
    ).then((results_from_increment) => {
        console.log('Results of the increment: ');
        console.log(results_from_increment);
    }).catch((error_) =>{
        console.log('Error from the increment', error_);
    });       
}
module.exports.logJSSONtoDB = logJSONtoDB;
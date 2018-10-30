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
    console.log(`Locating ${id_group} with the ${date} date....`);
    collection.findOne({_id: id_group}).then((result) => {   
        if (result == null){
            console.log(`${id_group} entry didn\'t exist before`);
            collection.insertOne(
                {
                    _id: id_group, 
                    downloads: 
                        {
                        [date] : 1
                        }
            }).then((inserted_res) => {console.log(JSON.stringify(inserted_res.ops, undefined, 2))})
                    .catch((insert_err) => {'Was unable to insert the new document ', console.log(insert_err);
                });  
        }else{
            console.log(`${result._id} exists`);
            var string_json = JSON.stringify(result.downloads);
            var download_json = JSON.parse(string_json);
            var keys = Object.keys(download_json);
            console.log(`JSon for ${result._id} is ${string_json}`);
            console.log('keys ', keys);
            var found = false;
            
            keys.forEach((key) => {
                if (key == date) {
                    found = true;
                    var key = 'downloads.' +[date];
                    console.log(`Found the date ${key} in the library ${result._id}`);
                    console.log(`Incrementing ${result._id} by 1`);
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
                            returnOriginal: false
                        }
                    ).then((results_from_increment) => {
                        console.log('Results of the increment: ');
                        console.log(results_from_increment);
                    }).catch((error_) =>{
                        console.log('Error from the increment', error_);
                    });       
                }
            });
            if (found == false){
                result.downloads[date] = 1;
                console.log(`Document ${id_group} with the date ${date} hasn\'t been found`);
                console.log('Let/`s create one');
                collection.findOneAndReplace(
                    {
                        _id: id_group
                    }, 
                    {
                        $set: 
                        {
                            downloads: result.downloads
                        }
                    }, 
                    {
                        returnOriginal: false
                    }
                ).then((results_from_update) => {
                    console.log(results_from_update);
                });              
            };
        }
    }).catch((error) => {
        console.log("Error ", error );            
    }) ;  
}
module.exports.logJSSONtoDB = logJSONtoDB;
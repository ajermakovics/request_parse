let date_time = require('date-and-time');
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
/*
Task:
When: GET /downloads/com.github.user/proj -> group and artifact name
Return JSON: 
{
  "week": <nr Downloads in last 7 days>
  "month": <Downloads in last 30 days>
}
*/

function getWeeklyMonthlyStatistics (artifact, collection){
    let id = artifact.group + ":" + artifact.name;
    return collection.findOne({_id: id})
    .then((res) => 
        {
            return getWeeklyMonthlyCount(res);
        })
    .catch((error) => {
            return error;     
        })
        
}

function getWeeklyMonthlyCount(data) {

    var keys = Object.keys(data.downloads);
    var last_7_days_download_count = 0;
    var last_30_days_download_count = 0;
    for (var key in keys) {
        var date = keys[key]; 
        var count = data.downloads[keys[key]];
       
        var download_date_string = date_time.parse(date, 'YYYYMMDD');
        let now = new Date();
        //difference between now and the date in milliseconds 
        var diff_in_milliseconds = now - download_date_string;
        const SEVEN_DAYS_IN_MILLISECONDS =  7 * 24 * 60 * 60 * 1000;
        const THIRTY_DAYS_IN_MILLISECONDS =  30 * 24 * 60 * 60 * 1000;
        //checks if the download date is within 7 or 30 days range
        if (diff_in_milliseconds<= SEVEN_DAYS_IN_MILLISECONDS){
            last_7_days_download_count += count;
        }
        if (diff_in_milliseconds <=THIRTY_DAYS_IN_MILLISECONDS){
            last_30_days_download_count += count;
        }
    }
    var count_json = {
        week: last_7_days_download_count,
        month: last_30_days_download_count
    }
    return count_json;
}
module.exports.logJSSONtoDB = logJSONtoDB;
module.exports.getWeeklyMonthlyStatistics = getWeeklyMonthlyStatistics;
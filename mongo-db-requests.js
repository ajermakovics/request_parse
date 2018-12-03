let date_time = require('date-and-time');

/** @return Promise **/
function logJSONtoDB(artifact, collection) {
    var id = artifact.group  + ":" + artifact.name;
    if(artifact.version)
        id = id + ':' + artifact.version

    var date = artifact.date;
    var key = 'downloads.' +[date];
    
    return collection.updateOne(
        { _id: id },
        { $inc: { [key]: + 1 } },
        { returnOriginal: false,  upsert: true }
    ).catch((error) =>{
        console.log('Error from the increment', error);
    });       
}

function incDoc(collection, id, date, amount) {
    var key = 'downloads.' + [date];

    return collection.updateOne(
        { _id: id },
        { $set: {migrated: true}, $inc: { [key]: + amount } },
        { returnOriginal: false,  upsert: true }
    ).catch((error) =>{
        console.log('Error from the increment', error);
    });
}

function setMigrated(collection, id) {
    return collection.updateOne(
        { _id: id },
        { $set: {migrated: true} },
        { returnOriginal: false,  upsert: true }
    ).catch((error) => {
        console.log('Error from the increment', error);
    });
}

const DAYS_IN_MS =  24 * 60 * 60 * 1000;
const SEVEN_DAYS_IN_MILLISECONDS =  7 * DAYS_IN_MS;
const THIRTY_DAYS_IN_MILLISECONDS =  30 * DAYS_IN_MS;

/** @param {Collection} collection **/
async function mergeDuplicates (collection) {
    console.log("collection: ", collection.dbName)
    var cnt = 0;

    let cursor = collection.find({"migrated": null}, {sort: {"_id": 1}})

    while(await cursor.hasNext()) {
        var doc = await cursor.next(); // Promise<doc>
        var realId = doc._id.toLowerCase()
        if(realId !== doc._id) {
            console.log("doc", cnt, doc._id, " != ", realId)
            for(var date in doc.downloads) {
                await incDoc(collection, realId, date, doc.downloads[date])
            }
            await setMigrated(collection, doc._id)
            cnt++
        }
    }

    console.log("done: ", cnt)
}

function getWeeklyMonthlyStatistics (artifact, collection) {
    let id = artifact.group + ":" + artifact.name;

    if(artifact.version)
        id = id + ':' + artifact.version

    return collection.findOne({_id: id})
        .then((res) => {
            return getWeeklyMonthlyCount(res || {});
        })
        .catch((error) => {
            return error;     
        })
}

function getWeeklyMonthlyCount(doc) {

    let downloads = doc["downloads"] || {}
    var last_7_days_download_count = 0;
    var last_30_days_download_count = 0;
    let now = new Date();

    for (var date in downloads) {
        var count = downloads[date] || 0;

        var download_date_string = date_time.parse(date, 'YYYYMMDD');
        var diff_in_milliseconds = now - download_date_string;

        if (diff_in_milliseconds <= THIRTY_DAYS_IN_MILLISECONDS){
            last_30_days_download_count += count;

            if (diff_in_milliseconds <= SEVEN_DAYS_IN_MILLISECONDS){
                last_7_days_download_count += count;
            }
        }
    }

    let count_json = {
        week: last_7_days_download_count,
        month: last_30_days_download_count
    }

    return count_json;
}
module.exports.logJSSONtoDB = logJSONtoDB;
module.exports.getWeeklyMonthlyStatistics = getWeeklyMonthlyStatistics;
module.exports.mergeDuplicates = mergeDuplicates;
var fs = require('fs');
var SQL = require('sql.js');
var sqlite3 = require('/root/node_modules/sqlite3').verbose();
var path = require('path');
var async = require('async');
var db = new sqlite3.Database('SensorDatabase'); // newdata is the name of my database

exports.dbRun = function runDB(){
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS Temperature (id INTEGER PRIMARY KEY, time INTEGER, value INT)"); // Ran at server startup, creates DB if it does not exist
        db.run("CREATE TABLE IF NOT EXISTS Light (id INTEGER PRIMARY KEY, time INTEGER, value INT)");
        console.log("Database initialized");
    });
}

exports.dbInsert = function insertDB(type, time, value){ // make type an integer so we don't have to deal with string comparison temp = 1 light = 2
    db.serialize(function() {
    if (type == 1){ //if temp
        var tmpstmt = db.prepare("INSERT INTO Temperature VALUES(NULL,?,?);"); //null for ID so it will autoincrement
        tmpstmt.run(time, value); //insert the given values
        tmpstmt.finalize(); //finalize and run our insert
    }
    else if (type == 2){  //if light
        var lightstmt = db.prepare("INSERT INTO Light VALUES(NULL,?,?)");
        lightstmt.run(time, value);
        lightstmt.finalize();
    }
    });
}


exports.dbGrab = function grabDB(callback, type, lowRange, highRange){ //lets create a javascript object and populate its fields
    db.serialize(function() {
    if (type == 1){ //if temp
        db.all("SELECT * FROM Temperature WHERE time BETWEEN ? and ?", lowRange, highRange, function(err, all) { //have our callback call our callback (I know)
         callback(err, all); //call the callback
        });
    }
    if (type == 2){ //if light
        db.all("SELECT * FROM Light WHERE time BETWEEN ? and ?", lowRange, highRange, function(err, all) { //same as above
         callback(err,all); //same as above
        });
    }
    });
}

exports.dbClose = function closeDB(){
    db.close(); //close our db
}

//Developer notes:
//Resources:
//https://github.com/mapbox/node-sqlite3
//http://stackoverflow.com/questions/3586775/what-is-the-correct-way-to-check-for-string-equality-in-javascript
//http://www.w3schools.com/sql/default.asp
//http://stackoverflow.com/questions/5525823/sql-select-query-that-returns-a-range
//http://www.techonthenet.com/sqlite/between.php
//http://stackoverflow.com/questions/13553736/node-js-determine-when-per-row-asynchronous-function-is-not-called-due-to-ther
//http://stackoverflow.com/questions/17731470/how-to-format-node-js-sqlite3-record-set-as-a-json-object-of-record-arrays
//http://www.w3schools.com/json/
//http://www.sqlite.org/autoinc.html
//http://stackoverflow.com/questions/15575914/how-to-read-a-sqlite3-database-using-node-js-synchronously
//http://stackoverflow.com/questions/2190850/create-a-custom-callback-in-javascript
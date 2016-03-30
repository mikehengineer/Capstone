var fs = require('fs');
var SQL = require('sql.js');
var sqlite3 = require('/root/node_modules/sqlite3').verbose();
var path = require('path');
var async = require('async');
var db = new sqlite3.Database('newdata'); // newdata is the name of my database

db.serialize(function() {
db.run("CREATE TABLE IF NOT EXISTS lorem (info TEXT)"); // I will create a new table if not exists

var stmt = db.prepare("INSERT INTO lorem VALUES (?)");
stmt.run("Hello World!"); // I will insert in my database "Hello World"
stmt.finalize();

db.each("SELECT rowid AS id, info FROM lorem", function(err, row) {
console.log(row.id + ": " + row.info);
});
});

db.close();

//Module for reading TMP36 temperature sensor
//Michael House
//Developed for 499 Capstone

var boneTemp = require('bonescript');
var tempInterval = 1000;        //set initial interval to 1 second
var tempread;

exports.temp = function printT(){
    var tempVoltage = boneTemp.analogRead('P9_40');
    if (tempVoltage.err)
        return -1;
    else
        return tempVoltage * 1800;
}


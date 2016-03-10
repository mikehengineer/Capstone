//Module for reading photocell light sensor
//Michael House
//Developed for 499 Capstone

var boneLight = require('bonescript');

exports.light = function printL(){
    var lightVoltage = boneLight.analogRead('P9_38');
    if (lightVoltage.err)
        return -1;
    else
        return lightVoltage * 1800;
}





//set interval in server eaccess readL from server (-1 for erro)
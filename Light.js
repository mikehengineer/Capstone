//Module for reading photocell light sensor
//Michael House
//Developed for 499 Capstone

var boneLight = require('bonescript');
var lightInterval = 10000;       //initial interval of 10 second

var voltL = function lightDisplay(lInput){
    var voltReading = lInput.value * 1800;      //1.8V reference voltage
    //console.log("Current light level: " + voltReading);
    if(lInput.err){
        console.log("Error detected in photocell: " + voltReading.err);
        return -1;
    }
    else
        return voltReading;
}

exports.function readL(){
    return boneLight.analogRead('P9_38', lightDisplay);
}

//set interval in server eaccess readL from server (-1 for erro)
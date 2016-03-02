//Module for reading photocell light sensor
//Michael House
//Developed for 499 Capstone

var boneLight = require('bonescript');
var lightInterval = 10000;       //initial interval of 10 second

function lightDisplay(lInput){
    var voltReading = lInput.value * 1800;      //1.8V reference voltage
    console.log("Current light level: " + voltReading);
    if(lInput.err){
        console.log("Error detected in photocell: " + voltReading.err);
    }
}

function readL(){
    boneLight.analogRead('P9_38', lightDisplay);
}

function settimerInterval(newInterval){
    lightInterval = newInterval;
}


setInterval(readL, lightInterval);
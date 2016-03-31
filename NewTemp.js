//Module for reading TMP36 temperature sensor
//Michael House
//Developed for 499 Capstone

var boneTemp = require('bonescript');
var tempInterval = 1000;        //set initial interval to 1 second

function tempDisplay(tInput){
    var voltReading = tInput.value * 1800;      //1.8 reference voltage
    var celcius = (voltReading - 500)/10;       //calculate celcius temp
    var fahrenheit = (celcius * (9/5)) + 32;    //calculate fahrenheit temp
    console.log("Temperature - Celcius: " + celcius + "  Fahrenheit: " + fahrenheit);       //print to console for now
    if (voltReading.err){
        console.log("Error detected: " + voltReading.err);      //if we get a 0 or negative value for voltage return the error
    }
}

function readT(){
    boneTemp.analogRead('P9_40', tempDisplay);      //analogRead (pin, callbackfunction) returns value and err
}

function settimerInterval(newInterval){
    tempInterval = newInterval;     //user specified interval
}

setInterval(readT, tempInterval);
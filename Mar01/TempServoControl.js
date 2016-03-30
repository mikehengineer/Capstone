//Module for controlling temperature servo (pin P9_14)
//Michael House
//Developed for 499 Capstone


var servo = require('bonescript');
var servopin = 'P9_14';
var duty_min = 0.03;

servo.pinMode(servopin, servo.ANALOG_OUTPUT);

setTimeout(setAngle(.1), 800); //these commands work however they will not work in succession... only one will work if the others are commented out
//setTimeout(setAngle(.2), 800);
//setTimeout(setAngle(.3), 800);
//setTimeout(setAngle(.35), 800);
//setTimeout(setAngle(.4), 800);
setTimeout(setAngle(.9), 800);
//setTimeout(setAngle(1), 800);


exports.tempS = function setAngle(angle){
    var duty = (angle * 0.115) + duty_min;
    servo.analogWrite(servopin, duty, 60);
}


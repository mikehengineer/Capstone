//Module for controlling temperature servo (pin P9_14)
//Michael House
//Developed for 499 Capstone


var servo = require('bonescript');
var servopin = 'P9_14';
var duty_min = 0.03;

servo.pinMode(servopin, servo.ANALOG_OUTPUT);

exports.tempS = function setAngle(angle){
    var duty = (angle * 0.115) + duty_min;
    servo.analogWrite(servopin, duty, 60);
}


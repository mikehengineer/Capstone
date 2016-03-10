//Module for controlling light servo (pin P8_13)
//Michael House
//Developed for 499 Capstone


var servo = require('bonescript');
var servopin = 'P8_13';
var duty_min = 0.03;

servo.pinMode(servopin, servo.ANALOG_OUTPUT);

exports.lightS = function setAngle(angle){
    var duty = (angle * 0.115) + duty_min;
    servo.analogWrite(servopin, duty, 60);
}

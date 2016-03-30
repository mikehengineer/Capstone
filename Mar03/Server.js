//Node.js webserver to interacting and controlling physical components
//Michael House
//Developed for 499 Capstone

var http = require('http').createServer(listener);     //need http module -> will createServer(listener) need listener function
var fs = require('fs');     //need filesystem module
var boneserver = require('bonescript');
var io = require('socket.io').listen(http);     //need io capabilities for this
var port = 9090; //avoid port 80 (web service) and port 3000 (cloud9 IDE)

var lightMonitor = require('./Light.js');
var tempMonitor = require('./Temperature.js');
var tempServo = require('./TempServoControl.js');
var lightServo = require('./LightServoControl.js');

var Temp;
var tempHolder;     //variable to compare temp level
var Light;
var lightHolder;    //variable to compare light level
var updateInterval = 10000;

 //create a server that reads in the callback listener function -> write later
http.listen(port); //start listening on port 9090

//test functions
var testlight = lightMonitor.light;
console.log("Current light level: " + testlight);

function listener(request, reponse){
    fs.readFile('HomeAutomation/index.html', function (err, data){                                              //read our index html and initiate callback function that will check for 500 error or will  
                                                if (err){                                                       //additionally it is best practice to wrap asynchronous calls with your own callback functions
                                                    response.writeHead(500);                                    //error encountered (internal server error)
                                                    return response.end('Unable to load index.html');           //tell the user about it
                                                }
                                                response.writeHead(200);                                        //everything went ok - no errors
                                                response.end(data);                                             //return the contents of our html
                                                }
)}
    
io.sockets.on('connection', function (socket){             //list of functions we will support when a socket is opened via callback
    socket.on('moveLServo', toggleLServo);      //call moveLServo method and pass toggleLServo value from client
    socket.on('moveTServo', toggleTServo);      //call moveTServo method with toggleTServo value from client
    socket.on('setTimer', settimerInterval);    //the following setInterval method runs continuous on socket connection where it continuously monitors sensors and updates when it detects change
    setInterval(function(){ 
        tempHolder = tempMonitor.temp;          //check current temp
        lightHolder = lightMonitor.light;       //check current light
            if(tempHolder != Temp || lightHolder != Light){     //if either sensor is different from the established valued
                socket.emit('light', '{"light":"' + lightHolder + '}');        //emit new light reading
                socket.emit('temp', '{"temp":"' + tempHolder + '}');          //emit new temperature reading
                Temp = tempHolder;      //make new value the established value
                Light = lightHolder;    //make new value the established value
            }
            }
            ,updateInterval);           //this is the frequency that this callback function is toggled
});


function settimerInterval(newInterval){
    updateInterval = newInterval;     //user specified interval
}

function moveLServo(pulseL){
    //pass servo movement
}

function moveTServo(pulseT){
    tempServo.tempS(pulseT);        //unsure if we can pass exported modules a value MAY NOT WORK
}




//Developer notes:
//Resources: 
//http://socket.io/docs/ 
//http://www.sitepoint.com/understanding-module-exports-exports-node-js/ 
//https://nodejs.org/dist/latest-v4.x/docs/api/
//https://nodesource.com/blog/understanding-socketio/
//http://www.sitepoint.com/understanding-module-exports-exports-node-js/
//http://danielnill.com/nodejs-tutorial-with-socketio/
//http://nodecasts.net/episodes/5-thinking-asynchronously

//listener function handles all incoming requests after the creation of the server -- the function uses readFile to read the entire html page and to return it

//3/3/2016 - we may want to not use an anonymous function for our setinterval call - need to fix imported sensor modules

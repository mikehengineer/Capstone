//Node.js webserver to interacting and controlling physical components
//Michael House
//Developed for 499 Capstone

var http = require('http').createServer(listener);     //need http module -> will createServer(listener) need listener function
var fs = require('fs');     //need filesystem module
var boneserver = require('bonescript');
var io = require('socket.io').listen(http);     //need io capabilities for this
var port = 9090; //avoid port 80 (web service) and port 3000 (cloud9 IDE)
var database = require('./SensorDatabase.js');
var lightMonitor = require('./Light.js');
var tempMonitor = require('./Temperature.js');
var tempServo = require('./TempServoControl.js');
var lightServo = require('./LightServoControl.js');

var Temp;
var tempHolder;     //variable to compare temp level
var Light;
var lightHolder;    //variable to compare light level
var updateInterval = 1000;

 //create a server that reads in the callback listener function -> write later
http.listen(port); //start listening on port 9090
database.dbRun();  //start our database

console.log("Home Automation Webserver Started!");

//database test

//setTimeout(database.dbInsert(1, grabTime(), 5), 1000);
//setTimeout(database.dbInsert(1, grabTime(), 6), 6000);
//setTimeout(database.dbInsert(1, grabTime(), 7), 15000);
//setTimeout(database.dbInsert(1, grabTime(), 8), 40000);
//setTimeout(database.dbInsert(1, grabTime(), 9), 60000);


//var valueHolder = 5;
//setInterval(function(){
//    database.dbInsert(1, grabTime(), valueHolder);
//    valueHolder = valueHolder + 5;
//}, 15000)

//var dataTest;
//database.dbGrab(function callback(err, tempResult){ //provide an anonymous callback function to our database query function results in all
//    dataTest = tempResult;
//    console.log(JSON.stringify(dataTest));
//    }, 1, 1, 5);

//console.log(grabTime());

function listener(req, res){
    fs.readFile('index.html', function (err, data){                                              //read our index html and initiate callback function that will check for 500 error or will  
                                                if (err){                                                       //additionally it is best practice to wrap asynchronous calls with your own callback functions
                                                    res.writeHead(500);                                    //error encountered (internal server error)
                                                    return res.end('Unable to load index.html');           //tell the user about it
                                                }
                                                res.writeHead(200);                                        //everything went ok - no errors
                                                res.end(data);                                             //return the contents of our html
                                                }
)}
    
io.sockets.on('connection', function (socket){             //list of functions we will support when a socket is opened via callback
    socket.on('moveLServo', moveLServo);      //call moveLServo method and pass toggleLServo value from client
    socket.on('moveTServo', moveTServo);      //call moveTServo method with toggleTServo value from client
    socket.on('setTimer', settimerInterval);    //the following setInterval method runs continuous on socket connection where it continuously monitors sensors and updates when it detects change
    setInterval(function(){ 
        tempHolder = tempMonitor.temp();          //check current temp
        lightHolder = lightMonitor.light();       //check current light
        database.dbInsert(1, grabTime(), tempHolder);
        database.dbInsert(2, grabTime(), lightHolder);
            if(tempHolder != Temp){     //if either sensor is different from the established valued
                socket.emit('temp', '{"temp":"' + tempHolder + '"}');          //emit new temperature reading
                Temp = tempHolder;      //make new value the established value
            }
            if(lightHolder != Light){
                socket.emit('light', '{"light":"' + lightHolder + '"}');        //emit new light reading
                Light = lightHolder;    //make new value the established value
            }
            }
            ,updateInterval);           //this is the frequency that this callback function is toggled
});

setInterval(function logData(){     //log data independent of whether there is a socket connection
    var tempforDB = tempMonitor.temp();
    var lightforDB = lightMonitor.light();
    database.dbInsert(1, grabTime(), tempforDB);
    database.dbInsert(2, grabTime(), lightforDB);
}, 10000);

function grabTime(){// lets grab the time and return it as a large integer value
    var time = new Date();
    
    var year = time.getFullYear();
    var month = time.getMonth() + 1; //starts at 0 so add one
    var day = time.getDate();
    var hour = time.getHours();
    var minute = time.getMinutes();
    var second = time.getSeconds();
    
    //lets get these into the correct place holding form XXXX(year)XX(month)XX(day)XX(hour)XX(minute)XX(second) -> full: XX,XXX,XXX,XXX,XXX 14 digit integer
    year = year * 10000000000;
    month = month * 100000000;
    day = day * 1000000;
    hour = hour * 10000
    minute = minute * 100;
    
    var integerTime = 0;
    integerTime = second + minute + hour + day + month + year;
    
    return integerTime;
}
function settimerInterval(newInterval){
    updateInterval = newInterval;     //user specified interval
}

function moveLServo(pulseL){
    lightServo.lightS(pulseL);
}

function moveTServo(pulseT){
   tempServo.tempS(pulseT);       
}

process.stdin.resume();

process.on('SIGINT', function() { //if our server process is interrupted call our server and db close
  serverClose();
});

process.on('exit', function(){
    serverClose();
});

process.on('SIGTERM', function(){
    serverClose();
});

function serverClose(){
    console.log("Shuting down... closing database...");
    database.dbClose();
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
//http://stackoverflow.com/questions/18692536/node-js-server-close-event-doesnt-appear-to-fire

//listener function handles all incoming requests after the creation of the server -- the function uses readFile to read the entire html page and to return it

//3/3/2016 - we may want to not use an anonymous function for our setinterval call - need to fix imported sensor modules
//celcius and fahrenheit button switch
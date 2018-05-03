//Node.js webserver to interacting and controlling physical components
//Michael House
//Developed for 499 Capstone

var http = require('http').createServer(listener); //need http module -> will createServer(listener) need listener function
var fs = require('fs'); //need filesystem module
var boneserver = require('bonescript');
var io = require('socket.io').listen(http); //need io capabilities for this
var port = 9090; //avoid port 80 (web service) and port 3000 (cloud9 IDE)
var database = require('./SensorDatabase.js');
var lightMonitor = require('./Light.js');
var tempMonitor = require('./Temperature.js');
var tempServo = require('./TempServoControl.js');
var lightServo = require('./LightServoControl.js');
var url = require('url');
var path = require('path');

var Temp;
var tempHolder; //variable to compare temp level
var Light;
var lightHolder; //variable to compare light level

//create a server that reads in the callback listener function -> write later
http.listen(port); //start listening on port 9090
database.dbRun(); //start our database

console.log("Home Automation Webserver Started!");

function listener(req, res) { //listener function will containe our routing implementation
    var urlPath = url.parse(req.url).pathname; //get our url path and parse
    var lastFinder = urlPath.lastIndexOf("."); //find the last period
    var fileExt = urlPath.substring(lastFinder + 1); //file extension exists once place past the .
    urlPath = urlPath.substr(1); //get rid of backslash
    var filename = path.join(process.cwd(), urlPath); //parent directory + filename to see if the file exists in 'Home Automation' directory
    fs.exists(filename, function(exists) { //call file exists and put our response implementation inside the call back
        var pageName;
        if (exists && urlPath != '') { //the client sends an empty request when the server is first connected to we need to make sure that the path exists and is not empty
            pageName = urlPath; //if file exists this will be fed to the filesystem.readfile
        }
        else {
            pageName = 'index.html'; //if the pathname is empty or does not exist give readfile index.html
        }
        fs.readFile(pageName, function(err, data) { //read the file if it exists and return the correct header type 
            if (err) {
                res.writeHead(500); //error encountered (internal server error)
                return res.end('Unable to load index.html'); //tell the user about it
            }
            else { //here we set the file extensions and write them to the header
                if (fileExt === 'html') res.writeHead(200, {
                    "Content-Type": 'text/html'
                });
                else if (fileExt === 'htm') res.writeHead(200, {
                    "Content-Type": 'text/html'
                });
                else if (fileExt === 'css') res.writeHead(200, {
                    "Content-Type": 'text/css'
                });
                else if (fileExt === 'js') res.writeHead(200, {
                    "Content-Type": 'text/javascript'
                });
                else if (fileExt === 'png') res.writeHead(200, {
                    "Content-Type": 'image/png'
                });
                else if (fileExt === 'jpg') res.writeHead(200, {
                    "Content-Type": 'image/jpg'
                });
                else if (fileExt === 'jpeg') res.writeHead(200, {
                    "Content-Type": 'image/jpeg'
                })
                res.end(data); //return file
            }
        })
    })
}

io.sockets.on('connection', function(socket) { //list of functions we will support when a socket is opened via callback
    socket.on('moveLServo', moveLServo); //call moveLServo method and pass toggleLServo value from client
    socket.on('moveTServo', moveTServo); //call moveTServo method with toggleTServo value from client
    socket.on('database', function(dbLow, dbHigh, dbType, qType) {
        console.log(dbType);
        console.log(qType);
        console.log(dbLow);
        console.log(dbHigh);
        database.dbnewGrab(function callback(err, tempResult2) {
            var dataTest2 = tempResult2;
            var dbTimeReturn = convertOutput(dataTest2, 1); //get an array of time values in string format
            var dbValueReturn = convertOutput(dataTest2, 2); //get an array of values     
            var dbnonStringTime = convertOutput(dataTest2, 3); //get an array of time values in integer format
            socket.emit('dataReturn', dbnonStringTime, dbValueReturn, dbType, dbTimeReturn); //format: time in int array format, values associate with time array, type of chart (temp or light), time array converted into string format 
        }, dbType, qType, dbLow, dbHigh);
    });
    setInterval(function() { //perform this on a regular interval, this will continously update our webpage with current temp and light values
        tempHolder = tempMonitor.temp(); //check current temp
        lightHolder = lightMonitor.light(); //check current light
        if (tempHolder != Temp) { //if either sensor is different from the established valued
            socket.emit('temp', '{"temp":"' + tempHolder + '"}'); //emit new temperature reading
            Temp = tempHolder; //make new value the established value
        }
        if (lightHolder != Light) {
            socket.emit('light', '{"light":"' + lightHolder + '"}'); //emit new light reading
            Light = lightHolder; //make new value the established value
        }
    }, 5000); //this is the frequency that this callback function is toggled
});

setInterval(function logData() { //log data independent of whether there is a socket connection
    var tempforDB = tempMonitor.temp(); //grab temp reading
    tempforDB = (tempforDB - 500) / 10; //in celcius
    tempforDB = (tempforDB * 9 / 5) + 32;
    var lightforDB = lightMonitor.light(); //grab light reading
    database.dbInsert(1, grabTime(), tempforDB); //insert temp
    database.dbInsert(2, grabTime(), lightforDB); //insert light
}, 60000); //log data interval

function grabTime() { // lets grab the time and return it as a large integer value
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
    hour = hour * 10000;
    minute = minute * 100;

    var integerTime = 0;
    integerTime = second + minute + hour + day + month + year;

    return integerTime; //our 14 digit time integer
}

function converTime(intTime) { //we will build a tertiary array that is a string representation of our time array - this will allow our x-axis that holds are time values to be human readable  
    var timeString; //initialize our time string variable     
    var dayMarker = 0; //a flag for any time that has an hour greater than 12 - we will convert to civilian time
    var intTime1 = intTime % 1000000; //hourminutesecond this trims everything before the hour digits
    var returnedHour = Math.floor(intTime1 / 10000); //this trims everything after the hour digits
    if (returnedHour > 12) { //if our hours are after noon, calculate civilian time
        returnedHour = returnedHour - 12;
        dayMarker = 1; //dayMarker = 1 add PM to our time, 0 add AM
    }
    var intTime2 = intTime % 10000; //this is four our minutes
    var returnedMinute = Math.floor(intTime2 / 100); //this follows the hour technique      
    var returnedSecond = intTime % 100;
    if (dayMarker == 0) {
        timeString = returnedHour + ' : ' + returnedMinute + ' : ' + returnedSecond + ' AM' //build our before noon string
    }
    else if (dayMarker == 1) {
        timeString = returnedHour + ' : ' + returnedMinute + ' : ' + returnedSecond + ' PM' //build our after noon string
    }
    return timeString; //return the resulting string should be hr : min : sec AM/PM
}

function convertOutput(inputArray, field) { //we need to turn the array of objects returned by the database into a normal array that HighCharts can read
    var outClass = function() {
        if (field === 1 || field === 3) { //if we are building our time array or our string time array we will create a time array in our object
            this.time = [];
        }
        if (field === 2) { //if we are building our value array we will initialize a value array
            this.value = [];
        }
    };

    var outArray = new outClass(); //create an instance of our outClass function

    for (var x = 0; x < inputArray.length; x++) { //loop our input array
        var outLine = inputArray[x];
        if (field === 1) { //if we are building time string array
            var currentTime = outLine.time; //copy the time from our original array
            var newTime = converTime(currentTime); //feed it to our string converting function
            outArray.time.push(newTime); //push string onto our new array
        }
        if (field === 2) { //if building value array
            var currentValue = outLine.value;
            outArray.value.push(currentValue); //extract and push our value onto new array
        }
        if (field === 3) { //if building integer time array - we need integer time array so that we can build our chart titles, these functions will rely on integer comparison calculations
            var currentTime3 = outLine.time;
            outArray.time.push(currentTime3); //extract and push our value onto new array
        }
    }
    return outArray; //return our HighCharts friendly array
}

function moveLServo(pulseL) {
    lightServo.lightS(pulseL);
}

function moveTServo(pulseT) {
    tempServo.tempS(pulseT);
}

process.stdin.resume();

process.on('SIGINT', function() { //if our server process is interrupted call our server and db close
    serverClose();
});

process.on('exit', function() {
    serverClose();
});

process.on('SIGTERM', function() {
    serverClose();
});

function serverClose() {
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
//http://stackoverflow.com/questions/36670966/turning-array-of-json-objects-into-an-array-for-highcharts-googlecharts
//listener function handles all incoming requests after the creation of the server -- the function uses readFile to read the entire html page and to return it

//3/3/2016 - we may want to not use an anonymous function for our setinterval call - need to fix imported sensor modules
//celcius and fahrenheit button switch

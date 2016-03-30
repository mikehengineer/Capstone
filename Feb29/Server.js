//Node.js webserver to interacting and controlling physical components
//Michael House
//Developed for 499 Capstone

var http = require('http');     //need http module -> will createServer(listener) need listener function
var fs = require('fs');     //need filesystem module
var boneserver = require('bonescript');
var io = require('io');     //need io capabilities for this
var port = 9090; //avoid port 80 (web service) and port 3000 (cloud9 IDE)

var server = http.createServer(listener); //create a server that reads in the callback listener function -> write later
server.listen(9090); start listening on port 9090
var sock = socket;      //create socket

function listener(request, reponse){
    fs.readFile('HomeAutomation/index.html', function (err, data){                                              //read our index html and initiate callback function that will check for 500 error or will  
                                                if (err){                                                       //additionally it is best practice to wrap asynchronous calls with your own callback functions
                                                    response.writeHead(500);                                    //error encountered (internal server error)
                                                    return response.end('Unable to load index.html');           //tell the user about it
                                                }
                                                response.writeHead(200);                                        //everything went ok - no errors
                                                response.end(data);                                             //return the contents of our html
                                                }
    });
    
function connected(socket){             //list of functions we will support when a socket is opened
    socket.on('moveLServo', toggleLServo);
    socket.on('moveTServo', toggleTServo);
}

io.sockets.on('connection', connected);





//Developer notes:
//Resources: 
//http://socket.io/docs/ 
//http://www.sitepoint.com/understanding-module-exports-exports-node-js/ 
//https://nodejs.org/dist/latest-v4.x/docs/api/

//listener function handles all incoming requests after the creation of the server -- the function uses readFile to read the entire html page and to return it
//
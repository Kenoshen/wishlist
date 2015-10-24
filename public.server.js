var local = true;
process.argv.forEach(function (val, index, array) {
	if(val === "prod"){
		local = false;
	}
});
console.log("=======================");
console.log("   BYTE BREAK SERVER");
console.log("=======================");
// requires
var express = require('express');
var app = express();
var vhost = require("vhost");
var bodyParser = require('body-parser');
var path = require("path");
var cssVar = require('my-css-var');
var myStatic = require('my-static');
// /////////////////////////////////////////////////////
// local requires
var me = require("../Me/server/serverApp.js");
//var edge = require("../Edge/server/serverApp.js");
var markail = require("../Markail/server/serverApp.js");
var carrie = require("../Carrie/server/serverApp.js");
function setup(){
	// set up virtual hosts
	var byteBreakStudiosVirtualHost = createVHost(app, "www.bytebreakstudios.com", "B->", "/../Me/public/portfolio", "/public");
	var regsProVirtualHost = createVHost(app, "www.regspro.com", "R->", "/../Markail/doesnotexist", "/public");
	//var edgeStudentLifeVirtualHost = createVHost(app, "www.edgestudentlife.com", "E->", "/../Edge/public", "/public");
	createVHost(app, "www.carriewingfield.com", "C->", "/../Carrie/public", "/public");
	// set up api calls
	me(byteBreakStudiosVirtualHost);
	//edge(edgeStudentLifeVirtualHost);
	markail(byteBreakStudiosVirtualHost);
	// move page
	// byteBreakStudiosVirtualHost.get("/move", function(req, res, next){safeSendFile(res, "/../Edge/public/html/ciy2015.html");});
	// byteBreakStudiosVirtualHost.get("/move/css/1", function(req, res, next){safeSendFile(res, "/../Edge/public/css/move2015.css");});
	// byteBreakStudiosVirtualHost.get("/move/css/2", function(req, res, next){safeSendFile(res, "/public/bootstrap-3.3.1/css/bootstrap.css");});
	// byteBreakStudiosVirtualHost.get("/move/img/move", function(req, res, next){safeSendFile(res, "/../Edge/public/img/move2015/move-clear.jpg");});
	// byteBreakStudiosVirtualHost.get("/move/img/jump", function(req, res, next){safeSendFile(res, "/../Edge/public/img/move2015/jump.jpg");});
	// byteBreakStudiosVirtualHost.get("/move/img/group", function(req, res, next){safeSendFile(res, "/../Edge/public/img/move2015/group.jpg");});
	// byteBreakStudiosVirtualHost.get("/move/img/sunset", function(req, res, next){safeSendFile(res, "/../Edge/public/img/move2015/sunset-banner.jpg");});
	// byteBreakStudiosVirtualHost.get("/move/img/beach", function(req, res, next){safeSendFile(res, "/../Edge/public/img/move2015/beach.jpg");});
	// byteBreakStudiosVirtualHost.get("/move/img/music", function(req, res, next){safeSendFile(res, "/../Edge/public/img/move2015/music.jpg");});
}
//
///////////////////////////////////////////////////////
// log helper
dateToStr = function (d) {
	return (((d.getUTCMonth()+1) < 10)?"0":"") + (d.getUTCMonth()+1) +"/" + 
	((d.getUTCDate() < 10)?"0":"") + d.getUTCDate() +"/"+ d.getUTCFullYear() + " " + 
	((d.getUTCHours() < 10)?"0":"") + d.getUTCHours() +":"+ 
	((d.getUTCMinutes() < 10)?"0":"") + d.getUTCMinutes() +":"+ 
	((d.getUTCSeconds() < 10)?"0":"") + d.getUTCSeconds() + "." + 
	((d.getUTCMilliseconds() < 100) ? (d.getUTCMilliseconds() < 10 ? "00" : "0") : "") + d.getUTCMilliseconds() + " GMT";
}
console.log(dateToStr(new Date()));
// logging
function logging(prefix){
	var f = function(req, res, next){
		var startTime = new Date();
		res.on('finish', function(){
			var status = res.statusCode;
			var responseTime = (new Date() - startTime);
			console.log(prefix + dateToStr(startTime) + ": " + req.method + " " + req.hostname + req.originalUrl + " (" + status + ":" + responseTime + ")");
		});
		next();
	};
	return f;
}
// access control headers
app.use(function (req, res, next){
	res.header('Access-Control-Allow-Origin', '*');
	res.header('Access-Control-Allow-Methods', '*');
	res.header('Access-Control-Allow-Headers', '*');

	next();
});
var sites = [];
// create the virtual hosts
function createVHost(app, host, prefix, location, shared){
	var tempApp = express();
	tempApp.use(bodyParser.json({limit: "50mb"}));
	tempApp.use(logging(prefix));
	cssVar(tempApp, {root: __dirname + location})
	// var k = {path: __dirname + shared, get: "pub"};
	// console.log("k: " + JSON.stringify(k));
	//myStatic(tempApp, k)
	tempApp.use(express.static(__dirname + location));
	tempApp.use("/public", express.static(__dirname + "/public"));
	if (local){
		// don't set up the virtual host, going to use ports instead
		sites.push({app: tempApp, host: host});
	} else {
		app.use(vhost(host, tempApp));
	}
	return tempApp;
}
// safe send file
function safeSendFile(res, filePath){
	res.sendFile(path.resolve(__dirname + filePath));
}
//
app.use(logging("A->"));
//
setup();
// ////////////////////////////////////////////////
//  START UP SERVER
// ////////////////////////////////////////////////
// return errors
app.on("error", function(req, res, next){
	console.log("Error: " + req.originalUrl);
	res.status(500).send({});
});
// start up server
if (local){
	for (var i = 0; i < sites.length; i++){
		console.log(sites[i].host + " listening on port: " + (7070 + i));
		sites[i].app.listen((7070 + i), function(){
			console.log("*");
		});
	}
} else {
	app.listen(80, function(){
		console.log("Server listening on port: 80");
	});
}

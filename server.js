const express = require("express");
const path = require("path");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);
const port = process.env.PORT || 3000;

var redis = require("redis");
var redisClient = redis.createClient();

app.use(express.static("public"));

let pixelData = [];
for(let i = 0; i < 128 * 128; i++){
	redisClient.send_command("bitfield", ["pixelCanvas", "GET", "u4", "#" + i], function(error, result){
		pixelData[i] = result;
	});
}

app.get("/", function(req, res){
	res.sendFile(__dirname + "/public/index.html");
});

//Directory is specific to the folder structure in the server
app.get("/picollaborate", function(req, res){
    res.sendFile(__dirname + "/public/index.html");
});

io.on("connection", function(socket){
	console.log("A user has connected: " + socket.id);
	socket.emit("board", {data: pixelData});
	
	socket.on("placePixel", function(pixel){
		if(pixel){
			if(0 <= pixel.x && pixel.x <= 127 && 0 <= pixel.y && pixel.y <= 127 && 0 <= pixel.color && pixel.color <= 15){
				let index = Math.floor(pixel.x) + Math.floor(pixel.y) * 128;
				pixelData[index] = Math.floor(pixel.color);
				redisClient.send_command("bitfield", ["pixelCanvas", "SET", "u4", "#" + index, pixel.color], function(error, result){
					//Redis DB changed
				});
				io.emit("placePixel", {x: pixel.x, y: pixel.y, color: pixel.color});
			}
		}
	});
	
	socket.on("disconnect", function(){
		console.log("User disconnected: " + socket.id);
	});
});

server.listen(port, () => {
    console.log("Listening on port " + port);
});
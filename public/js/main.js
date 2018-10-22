const socket = io.connect();

const COLOR_PALETTE = ["#000000", "#1d2b53", "#7e2553", "#008751",
						"#ab5236", "#5f574f", "#c2c3c7", "#fff1e8",
						"#ff004d", "#ffa300", "#ffec27", "#00e436",
						"#29adff", "#83769c", "#ff77a8", "#ffccaa"];

const canvas = document.getElementById("pixelCanvas");
const largeCanvas = document.getElementById("pixelCanvasLarge");
const ctx = canvas.getContext("2d");
const ctxLarge = largeCanvas.getContext("2d");
ctxLarge.imageSmoothingEnabled = false;

let zoomLevel = 8;
let currentColor = 11;
let imageData = ctx.getImageData(0, 0, 128, 128);

function initPalette(){
	for(let i = 0; i < COLOR_PALETTE.length; i++){
		let btn = document.createElement("div");
		btn.className = "paletteButton";
		btn.style.backgroundColor = COLOR_PALETTE[i];
		btn.setAttribute("colorIndex", i);
		btn.addEventListener("click", function(event){
			currentColor = this.getAttribute("colorIndex");
		});
		document.getElementById("palette").appendChild(btn);
	}
}

initPalette();

//https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

//https://stackoverflow.com/questions/55677/how-do-i-get-the-coordinates-of-a-mouse-click-on-a-canvas-element
function getCursorPosition(canvas, event) {
    var rect = canvas.getBoundingClientRect();
    var x = event.clientX - rect.left;
    var y = event.clientY - rect.top;
    //console.log("x: " + x + " y: " + y);
	return {x: x, y: y};
}

largeCanvas.addEventListener("click", function(event){
	let mousePos = getCursorPosition(this, event);
	let px = Math.floor(mousePos.x / zoomLevel);
	let py = Math.floor(mousePos.y / zoomLevel);
	//console.log(px + ", " + py);
	socket.emit("placePixel", {x: px, y: py, color: currentColor});
});

socket.on("placePixel", function(pixel){
	//console.log("Server sent pixel: " + pixel.x + ", " + pixel.y);
	//Slow method: drawRect()
	ctx.fillStyle = COLOR_PALETTE[pixel.color];
	ctx.fillRect(pixel.x, pixel.y, 1, 1);
	ctxLarge.fillStyle = COLOR_PALETTE[pixel.color];
	ctxLarge.fillRect(pixel.x * zoomLevel, pixel.y * zoomLevel, zoomLevel, zoomLevel);
});

socket.on("board", function(board){	
	//Directly edit the pixel data
	imageData = ctx.getImageData(0, 0, 128, 128);
	let data = imageData.data;
	let boardIndex = 0;
	for(let y = 0; y < 128; y++){
		for(let x = 0; x < 128; x++){
			let index = (y * 128 + x) * 4;
			let col = COLOR_PALETTE[0];
			if(0 <= board.data[boardIndex] && board.data[boardIndex] <= 15){
				col = COLOR_PALETTE[board.data[boardIndex]];
				boardIndex++;
			}
			col = hexToRgb(col);
			data[index] = col.r;
			data[++index] = col.g;
			data[++index] = col.b;
			data[++index] = 255;
		}
	}
	ctx.putImageData(imageData, 0, 0);
	//ctxLarge.drawImage(ctx.canvas, 0, 0, 128, 128, 0, 0, 1024, 1024);
});

//Cursor rectangle drawing
let mouseX = 0;
let mouseY = 0;

largeCanvas.addEventListener("mousemove", updateMousePosition, false);

function updateMousePosition(event){
	let cursorPos = getCursorPosition(this, event);
	mouseX = cursorPos.x;
	mouseY = cursorPos.y;
}

function update(){
	ctxLarge.drawImage(ctx.canvas, 0, 0, 128, 128, 0, 0, 128 * zoomLevel, 128 * zoomLevel);
	
	ctxLarge.fillStyle = COLOR_PALETTE[currentColor];
	ctxLarge.fillRect(Math.floor(mouseX / zoomLevel) * zoomLevel, Math.floor(mouseY / zoomLevel) * zoomLevel, zoomLevel, zoomLevel);
	
	requestAnimationFrame(update);
}

update();
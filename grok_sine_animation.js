window.onload = function () {

var canvas = document.getElementById("sine_animation_canvas");
var ctx = canvas.getContext('2d');

canvas.width = 400;
canvas.height = 30;

var pink_sine = new Image();
pink_sine.src = "pink_sine_small.png";

var blue_sine = new Image();
blue_sine.src = "blue_sine_small.png"

var IMAGEWIDTH = 130;
var numImages = Math.ceil(parseFloat(canvas.width) / IMAGEWIDTH) + 1;

// starting positions of the blue and pink images
var b_offset = 0;
var p_offset = 0;

// Speed in pixels/frame of each image
var p_delta = 0.4;
var b_delta = 0.1;

function step() {
  ctx.clearRect (0, 0, canvas.width, canvas.height);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "screen";

  // Pink sine wave moves leftwards
  if (pink_sine.width + p_offset < 0) {
    p_offset = 0;
  }

  for (var i = 0; i < numImages; i++) {
    ctx.drawImage(pink_sine, i * pink_sine.width + p_offset, 0);
  }

  // Blue moves rightwards
  if (-blue_sine.width + b_offset > 0) {
    b_offset = 0;
  }

  for (var i = numImages; i > 0; i--) {
    ctx.drawImage(blue_sine, canvas.width - i * blue_sine.width + b_offset, 0);
  }

  b_offset += b_delta;
  p_offset -= p_delta;

  // Animate forever
  requestAnimationFrame(step);
}

function resizeCanvas() {
  canvas.width = document.getElementById("animation_header").offsetWidth;
  numImages = Math.ceil(parseFloat(canvas.width) / IMAGEWIDTH) + 1;
  console.log(numImages);
}

resizeCanvas();

// Resize the canvas to fill browser window dynamically
window.addEventListener('resize', resizeCanvas, false);

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame ||
                              window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

// Kick off the animation
requestAnimationFrame(step);
};

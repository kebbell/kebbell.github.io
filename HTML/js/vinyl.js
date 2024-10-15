// Get the canvas element
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Set the canvas dimensions
canvas.width = 400;
canvas.height = 400;

// Define the turntable properties
const turntable = {
  x: canvas.width / 2,
  y: canvas.height / 2,
  radius: 100,
  rotation: 0
};

// Draw the turntable
function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(turntable.x, turntable.y, turntable.radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.rotate(turntable.rotation);
  turntable.rotation += 0.01;
}

// Animate the turntable
setInterval(draw, 16);

function draw() {
  console.log('Drawing turntable...');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.beginPath();
  ctx.arc(turntable.x, turntable.y, turntable.radius, 0, 2 * Math.PI);
  ctx.stroke();
  ctx.rotate(turntable.rotation);
  turntable.rotation += 0.01;
}
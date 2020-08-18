// Global constants
const xmax=1280;
const ymax=720;

// Game state is global to prevent it going out of scope
var gs={
  // Animation frame of reference
  step:(1/60), // target step time @ 60 fps
  acc:0, // accumulated time since last frame
  lasttime:0, // time of last frame

  // physics in pixels per frame @ 60fps
  gravity:0.1,
  terminalvelocity:25,
  airresistance:0.00001,
  friction:0.1,
  wind:0, // TODO add angle and speed

  // Canvas object
  canvas:null,
  ctx:null,

  ball:{
    // Position
    x:0,
    y:ymax,
    z:0,

    // Velocity
    vx:4,
    vy:-8,
    vz:0
  },

  state:0 // 0=intro, 1=title, 2=ingame 3=completed
};

// Check if the ball is currently moving
function ballmoving()
{
  return ((gs.ball.vx!=0) || (gs.ball.vy!=0) || (gs.ball.vz!=0));
}

// Move the ball onwards
function moveball()
{
  // Apply gravity
  if (gs.ball.vy<gs.terminalvelocity)
    gs.ball.vy+=gs.gravity;

  // Apply wind
  gs.ball.vx+=gs.wind;

  // Slow ball down by air resistance or friction
  if (gs.ball.vx>0)
  {
    if (gs.ball.y<ymax)
      gs.ball.vx-=gs.airresistance;
    else
      gs.ball.vx-=gs.friction;
  }

  gs.ball.x+=gs.ball.vx;
  gs.ball.y+=gs.ball.vy;
  gs.ball.z+=gs.ball.vz;

  // Stop it going off screen
  if (gs.ball.x>xmax)
  {
    gs.ball.x=xmax;
  }

  // When it hits the ground reverse to half it's vertical velocity
  if (gs.ball.y>ymax)
  {
    gs.ball.y=ymax;
    gs.ball.vy=-(gs.ball.vy*0.5);
  }
}

// Render the current scene
function render()
{
  // Clear the screen
  gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

  gs.ctx.beginPath();
  gs.ctx.arc(Math.floor(gs.ball.x), Math.floor(gs.ball.y), 10, 0, 2*Math.PI);
  gs.ctx.fill();
}

// Update step
function update()
{
  // Move the ball
  moveball();
}

// Called once per frame for animation updates
function rafcallback(timestamp)
{
  // First time round, just save epoch
  if (gs.lasttime>0)
  {
    // Determine accumulated time since last call
    gs.acc+=((timestamp-gs.lasttime) / 1000);

    // If it's more than 15 seconds since last call, reset
    if ((gs.acc>gs.step) && ((gs.acc/gs.step)>(60*15)))
      gs.acc=gs.step*2;

    // Process the "steps" since last call
    while (gs.acc>gs.step)
    {
      update();

      gs.acc-=gs.step;
    }
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  // Perform a render step
  render();

  // Request we are called on next frame if still playing
  if (gs.state==2)
    window.requestAnimationFrame(rafcallback);
}

// Handle screen resizing to maintain correctly centered display
function resize()
{
  var height=window.innerHeight;
  var ratio=xmax/ymax;
  var width=Math.floor(height*ratio);
  var top=0;
  var left=Math.floor((window.innerWidth/2)-(width/2));

  if (width>window.innerWidth)
  {
    width=window.innerWidth;
    ratio=ymax/xmax;
    height=Math.floor(width*ratio);

    left=0;
    top=Math.floor((window.innerHeight/2)-(height/2));
  }

  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";

  gs.canvas.style.width=width+"px";
  gs.canvas.style.height=height+"px";
}

// Reset ball
function kick()
{
  gs.ball.x=0;
  gs.ball.y=ymax;
  gs.ball.z=0;

  gs.ball.vx=4;
  gs.ball.vy=-8;
  gs.ball.vz=0;

  // Between -0.05 and +0.05
  gs.wind=(rng()-0.5)*0.01;
}

function startup()
{
  // Test using RNG
  // test it, to get a number between 0 and 7
  // should give the sequence 5, 4, 1, 7 from startup
  console.log(Math.floor(rng()*8));
  console.log(Math.floor(rng()*8));
  console.log(Math.floor(rng()*8));
  console.log(Math.floor(rng()*8));

  gs.canvas=document.getElementById('canvas');
  gs.ctx=this.canvas.getContext('2d');

  gs.ctx.fillStyle="rgba(255,255,255,1)";
  gs.ctx.strokeStyle="rgba(255,255,255,1)";
  gs.ctx.lineWidth=1;

  // Put straight into game
  gs.state=2;

  window.requestAnimationFrame(rafcallback);

  resize();
  window.addEventListener("resize", resize);

  setInterval(function(){kick();}, 6000);
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };

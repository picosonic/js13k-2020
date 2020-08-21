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

  // Offscreen canvas
  offcanvas:null,
  offctx:null,

  hole:1,

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

  // Copy the offscren canvas
  gs.ctx.drawImage(gs.offcanvas, 0, 0);

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
  // Apparently gamepad support only now works via https
  //   see https://hacks.mozilla.org/2020/06/securing-gamepad-api/
  if ((location.protocol=='https:') && (!!(navigator.getGamepads)))
    gamepadscan();

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

//  gs.canvas.style.width=width+"px";
//  gs.canvas.style.height=height+"px";
  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+(width/xmax)+')';
}

function generatecourse()
{
  var numsegments=Math.floor(rng()*(gs.hole/6))+2;
  var segment;
  var x=0;
  var y=0;
  var lasty=0;
  var segments=[];

  gs.offctx.clearRect(0, 0, gs.offcanvas.width, gs.offcanvas.height);

  gs.offctx.fillStyle="rgba(0,255,0,1)";
  gs.offctx.strokeStyle="rgba(0,255,0,1)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.font="50px sans";
  gs.offctx.fillText("Hole "+gs.hole, 10, 50);

  gs.offctx.beginPath();

  // Calculate segments
  for (segment=0; segment<numsegments; segment++)
  {
    x+=(xmax/10);
    y=(Math.floor(rng()*(lasty==0?5:2))+(lasty==0?1:lasty))*(ymax/6);

    segments.push({x:x, y:y});

    if (segment==0)
      gs.offctx.moveTo(Math.floor(x), Math.floor(y));
    else
      gs.offctx.lineTo(Math.floor(x), Math.floor(y));
  }
  gs.offctx.stroke();

  // Draw tee
  gs.offctx.fillStyle="rgba(255,0,0,1)";
  gs.offctx.strokeStyle="rgba(255,0,0,1)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(segments[0].x, segments[0].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw hole
  gs.offctx.fillStyle="rgba(0,0,255,1)";
  gs.offctx.strokeStyle="rgba(0,0,255,1)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(segments[segments.length-1].x, segments[segments.length-1].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Tee

  // Bend left or right

  // Length of course

  // Width of course

  // Green

  // Rough

  // Trees

  // Other greenery edges

  // Hazards - sand or water
}

// Reset ball
function kick()
{
  gs.hole++;
  if (gs.hole>18) gs.hole=1;

  generatecourse();

  gs.ball.x=0;
  gs.ball.y=ymax;
  gs.ball.z=0;

  gs.ball.vx=4;
  gs.ball.vy=-8;
  gs.ball.vz=0;

  // Between -0.05 and +0.05
  gs.wind=(rng()-0.5)*0.01;
}

function clearinputstate()
{
  keystate=0;
  padstate=0;
}

function ispressed(keybit)
{
  return (((keystate&keybit)!=0) || ((padstate&keybit)!=0));
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
  gs.ctx=gs.canvas.getContext('2d');

  gs.ctx.fillStyle="rgba(255,255,255,1)";
  gs.ctx.strokeStyle="rgba(255,255,255,1)";
  gs.ctx.lineWidth=1;

  gs.offcanvas=document.createElement('canvas');
  gs.offcanvas.width=xmax;
  gs.offcanvas.height=ymax;
  gs.offctx=gs.offcanvas.getContext('2d');

  resize();
  window.addEventListener("resize", resize);

  document.onkeydown=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 1);
  };

  document.onkeyup=function(e)
  {
    e = e || window.event;
    updatekeystate(e, 0);
  };

  // Stop things from being dragged around
  window.ondragstart=function(e)
  {
    e = e || window.event;
    e.preventDefault();
  };

  // Put straight into game
  gs.state=2;

  generatecourse();
  window.requestAnimationFrame(rafcallback);

  setInterval(function(){kick();}, 6000);
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };

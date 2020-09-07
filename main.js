// Global constants
const xmax=1280;
const ymax=720;

const PIOVER180=(Math.PI/180); // lookup for converting degrees to radians

const YARDSPERPIXEL=0.5; // Number of yards in a pixel

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
  wind:{
    vx:0,
    vy:0,
    vz:0
  },

  // Canvas object
  canvas:null,
  ctx:null,

  // Offscreen canvas
  offcanvas:null,
  offctx:null,

  // HUD canvas
  hudcanvas:null,
  hudctx:null,

  // Effects canvas
  fxcanvas:null,
  fxctx:null,

  // Swing meter
  swingstage:1, // 0=hidden, 1=idle, 2=power, 3=accuracy, 4=done
  swingpoint:0, // point within swing to draw paddle
  swingpower:0, // selected power %
  swingaccuracy:0, // selected accuracy (hook, perfect, slice)
  swingspeed:0, // movement per frame as a percentage

  hole:1, // Current hole
  holes:18, // Total holes

  par:[0,1,0,1,0,1,0,2,0,2,0,2,0,3,0,3,0,3],
  strokes:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

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

  course:{
    segments:[],
    numsegments:0
  },

  // Selected club
  club:0,

  clubs:[
    // Woods / Drivers
    {name:"1 Wood", dist:278, loft:14},
    {name:"2 Wood", dist:244, loft:16},
    {name:"3 Wood", dist:222, loft:18},
    {name:"4 Wood", dist:200, loft:20},
    {name:"5 Wood", dist:178, loft:22},

    // Irons
    {name:"1 Iron", dist:211, loft:14},
    {name:"2 Iron", dist:200, loft:16},
    {name:"3 Iron", dist:189, loft:20},
    {name:"4 Iron", dist:178, loft:25},
    {name:"5 Iron", dist:167, loft:29},
    {name:"6 Iron", dist:156, loft:31},
    {name:"7 Iron", dist:145, loft:34},
    {name:"8 Iron", dist:134, loft:37},
    {name:"9 Iron", dist:123, loft:41},

    // Wedges
    {name:"Pitching", dist:115, loft:50},
    {name:"Gap", dist:106, loft:54},
    {name:"Sand", dist:70, loft:58},
    {name:"Lob", dist:30, loft:64},

    // Putter
    {name:"Putter", dist:10, loft:4},
  ],

  timeline:new timelineobj(),
  txttimeline:new timelineobj(),
  showscoreboard:false,
  state:0 // 0=intro, 1=title, 2=tee, 3=fore, 4=completed
};

// Calculate Par for hole
function calculatepar(distance)
{
  if (distance<251)
    return 3;

  if (distance<451)
    return 4;

  if (distance<691)
    return 5;

  return 6;
}

// Convert strokes to score text
function strokeresult(strokes, hole)
{
  var delta=gs.par[hole-1]-strokes;

  switch (delta)
  {
    case -3:
      return "Double Eagle";
      break;

    case -2:
      return "Eagle";
      break;

    case -1:
      return "Birdie";
      break;

    case 0:
      return "Par";
      break;

    case 1:
      return "Bogey";
      break;

    case 2:
      return "Double Bogey";
      break;

    case 3:
      return "Triple Bogey";
      break;

    default:
      if (strokes==1)
        return "Hole In One";
      else
        return ""+strokes+" strokes";
      break;
  }
}

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

  // Apply wind when off ground
  if (gs.ball.y<ymax)
    gs.ball.vx+=gs.wind.vx;

  // Slow ball down by air resistance or friction
  if (gs.ball.vx>0)
  {
    if (gs.ball.y<ymax)
      gs.ball.vx-=gs.airresistance;
    else
      gs.ball.vx-=gs.friction;

    // Stop it going backwards
    if (gs.ball.vx<0)
      gs.ball.vx=0;
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

function swingmeter()
{
  var point=32;

  // Draw the swing meter
  gs.hudctx.strokeStyle="rgba(255,255,255,0.6)";
  gs.hudctx.lineWidth=40;

  gs.hudctx.beginPath();
  gs.hudctx.arc(640, 500, 160, (2*Math.PI)-0.2, Math.PI+0.2);
  gs.hudctx.stroke();

  // Draw the swing scale
  gs.hudctx.strokeStyle="rgb(0,0,0)";
  gs.hudctx.lineWidth=2;

  for (var i=0; i<=100; i+=25)
  {
    write(gs.hudctx, 630+(205*Math.cos(i/point)), 500+(205*Math.sin(i/point)), ""+i, 2, "rgba(255,255,255,0.7)");

    gs.hudctx.beginPath();
    gs.hudctx.moveTo(640+(135*Math.cos(i/point)), 500+(135*Math.sin(i/point)));
    gs.hudctx.lineTo(640+(185*Math.cos(i/point)), 500+(185*Math.sin(i/point)));
    gs.hudctx.stroke();
  }

  // Add the text
  write(gs.hudctx, 465, 430, ""+gs.clubs[gs.club].dist+"y", 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, 765, 430, gs.clubs[gs.club].name, 3, "rgba(255,255,255,0.7)");

  // Draw the swing power (if set)
  if (gs.swingpower!=0)
  {
    gs.hudctx.strokeStyle="rgb(255,0,0)";
    gs.hudctx.lineWidth=10;

    gs.hudctx.beginPath();
    gs.hudctx.moveTo(640+(135*Math.cos(gs.swingpower/point)), 500+(135*Math.sin(gs.swingpower/point)));
    gs.hudctx.lineTo(640+(185*Math.cos(gs.swingpower/point)), 500+(185*Math.sin(gs.swingpower/point)));
    gs.hudctx.stroke();
  }

  // Draw the paddle
  gs.hudctx.strokeStyle="rgb(0,0,255)";
  gs.hudctx.lineWidth=10;

  gs.hudctx.beginPath();
  gs.hudctx.moveTo(640+(135*Math.cos(gs.swingpoint/point)), 500+(135*Math.sin(gs.swingpoint/point)));
  gs.hudctx.lineTo(640+(185*Math.cos(gs.swingpoint/point)), 500+(185*Math.sin(gs.swingpoint/point)));
  gs.hudctx.stroke();
}

// Show scoreboard
function scoreboard()
{
  var hole;
  var cx=0;
  var cy=0;
  var total=0;

  gs.hudctx.save();

  // Whole screen shaded
  gs.hudctx.fillStyle="rgba(0,0,0,0.6)";
  gs.hudctx.strokeStyle="rgba(0,0,0,0.6)";
  gs.hudctx.lineWidth=1;

  gs.hudctx.fillRect(0, 0, gs.hudcanvas.width, gs.hudcanvas.height);

  // Score board
  gs.hudctx.fillStyle="rgba(150,111,51,0.8)";
  gs.hudctx.strokeStyle="rgba(150,111,51,0.9)";
  gs.hudctx.lineWidth=1;

  gs.hudctx.fillRect(50, 50, gs.hudcanvas.width-100, gs.hudcanvas.height-100);

  // Title
  write(gs.hudctx, 200, 80, "Coding Golf - Broken Links", 8, "rgba(255,255,0,0.9)");

  // Holes - Out
  cx=280; cy=180;
  write(gs.hudctx, 1000, cy, "Out", 6, "rgba(255,255,0,0.9)");
  write(gs.hudctx, 60, cy+60, "Par", 6, "rgba(255,255,0,0.9)");
  write(gs.hudctx, 60, cy+120, "Strokes", 6, "rgba(255,255,0,0.9)");
  for (hole=0; hole<(gs.holes/2); hole++)
  {
    write(gs.hudctx, cx+(80*hole), cy, ""+(hole+1), 6, "rgba(255,255,255,0.9)");
    write(gs.hudctx, cx+(80*hole), cy+60, ""+(gs.par[hole]), 5, "rgba(255,128,128,0.9)");
    write(gs.hudctx, cx+(80*hole), cy+120, ""+(gs.strokes[hole]), 5, "rgba(128,255,128,0.9)");
  }

  // Holes - Home
  cx=280; cy=400;
  write(gs.hudctx, 1000, cy, "Home", 6, "rgba(255,255,0,0.9)");
  write(gs.hudctx, 60, cy+60, "Par", 6, "rgba(255,255,0,0.9)");
  write(gs.hudctx, 60, cy+120, "Strokes", 6, "rgba(255,255,0,0.9)");
  for (hole=gs.holes/2; hole<gs.holes; hole++)
  {
    write(gs.hudctx, cx+(80*(hole-(gs.holes/2))), cy, ""+(hole+1), 6, "rgba(255,255,255,0.9)");
    write(gs.hudctx, cx+(80*(hole-(gs.holes/2))), cy+60, ""+(gs.par[hole]), 5, "rgba(255,128,128,0.9)");
    write(gs.hudctx, cx+(80*(hole-(gs.holes/2))), cy+120, ""+(gs.strokes[hole]), 5, "rgba(128,255,128,0.9)");
  }

  // Total
  write(gs.hudctx, 900, 600, "Total", 6, "rgba(255,255,0,0.9)");
  for (hole=0; hole<gs.holes; hole++)
    total+=gs.strokes[hole];
  write(gs.hudctx, 1050, 600, ""+total, 6, "rgba(255,255,255,0.9)");

  gs.hudctx.restore();
}

// Show wind direction and speed
function windmeter()
{
  var cx=1200;
  var cy=70;
  var angle=0;
  var size=100;
  var windspeed=0;

  gs.hudctx.fillStyle="rgba(255,255,255,0.2)";
  gs.hudctx.strokeStyle="rgba(255,255,255,0.6)";

  gs.hudctx.lineWidth=1;

  gs.hudctx.fillRect(cx-(size/2), cy-(size/2), size, size);

  gs.hudctx.fillStyle="rgba(255,255,255,0.6)";
  gs.hudctx.strokeStyle="rgba(155,155,255,0.9)";

  angle=Math.atan2(gs.wind.vy, gs.wind.vx)*180/Math.PI; // converted to degrees
  windspeed=Math.abs(Math.sqrt((gs.wind.vx*gs.wind.vx)+(gs.wind.vy*gs.wind.vy))*1000).toFixed(0);

  // Arrow
  gs.hudctx.beginPath();
  gs.hudctx.moveTo(cx+(40*Math.cos(angle)), cy+(40*Math.sin(angle)));
  gs.hudctx.lineTo(cx+(40*Math.cos(angle-160)), cy+(40*Math.sin(angle-160)));
  gs.hudctx.lineTo(cx+(40*Math.cos(angle+160)), cy+(40*Math.sin(angle+160)));
  gs.hudctx.lineTo(cx+(40*Math.cos(angle)), cy+(40*Math.sin(angle)));
  gs.hudctx.fill();

  write(gs.hudctx, 1150, 140, windspeed+"mph", 3, "rgba(255,255,255,0.7)");
}

// Show strokes/par/as-crow-files distance from ball to hole
function showinfobox()
{
  var cx=20;
  var cy=20;
  var distance;
  var dx=0;
  var dy=0;

  gs.hudctx.fillStyle="rgba(255,255,255,0.2)";
  gs.hudctx.strokeStyle="rgba(255,255,255,0.6)";

  gs.hudctx.lineWidth=1;

  gs.hudctx.fillRect(cx, cy, 150, 155);

  gs.hudctx.fillStyle="rgba(255,255,255,0.6)";
  gs.hudctx.strokeStyle="rgba(155,155,255,0.9)";

  // TODO calculate distance from ball not tee
  dx=Math.abs(gs.course.segments[gs.course.segments.length-1].x-gs.course.segments[0].x);
  dy=Math.abs(gs.course.segments[gs.course.segments.length-1].y-gs.course.segments[0].y);
  distance=Math.floor(Math.sqrt((dx*dx)+(dy*dy))*YARDSPERPIXEL);

  write(gs.hudctx, cx+15, cy+15, distance+" yds", 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, cx+15, cy+50, "Stroke "+(gs.strokes[gs.hole-1]+1), 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, cx+15, cy+85, "Par "+gs.par[gs.hole-1], 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, cx+15, cy+120, gs.clubs[gs.club].name, 3, "rgba(255,255,255,0.7)");
}

// Render the current scene
function render()
{
  // Clear the screen
  gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

  // Copy the offscren canvas
  gs.ctx.drawImage(gs.offcanvas, 0, 0);

  // Draw the ball
  gs.ctx.beginPath();
  gs.ctx.arc(Math.floor(gs.ball.x), Math.floor(gs.ball.y), 10, 0, 2*Math.PI);
  gs.ctx.fill();

  gs.hudctx.clearRect(0, 0, gs.hudcanvas.width, gs.hudcanvas.height);

  if (gs.showscoreboard)
  {
    scoreboard();
  }
  else
  {
    shadowwrite(gs.hudctx, 520, 10, "Hole "+gs.hole, 10, "rgba(255,255,0,0.9)");

    if (gs.swingstage>0)
      swingmeter();

    windmeter();

    showinfobox();
  }
}

// Update step
function update()
{
  // Move the ball
  if (!gs.showscoreboard)
    moveball();

  // Check for swing meter
  switch (gs.swingstage)
  {
    case 0: // Hidden - do nothing
      break;

    case 1: // Idle - wait for keypress
      if (ispressed(16))
      {
        clearinputstate();

        gs.swingpower=0;
        gs.swingaccuracy=0;

        gs.swingspeed=1;
        gs.swingpoint=0;

        gs.swingstage=2;
      }
      break;

    case 2: // Power - power from 0% to 100%
      gs.swingpoint+=gs.swingspeed;

      if (ispressed(16))
      {
        clearinputstate();

        gs.swingpower=gs.swingpoint;
        gs.swingstage=3;
      }

      if (gs.swingpoint>105)
      {
        gs.swingpoint=105;
        gs.swingspeed*=1.2;

        gs.swingpower=gs.swingpoint;
        gs.swingstage=3;
      }
      break;

    case 3: // Accuracy - aim for sweetspot
      gs.swingpoint-=gs.swingspeed;

      if (ispressed(16))
      {
        clearinputstate();

        gs.swingaccuracy=gs.swingpoint;
        gs.swingstage=4;
      }

      if (gs.swingpoint<-5)
      {
        gs.swingpoint=-5;
        gs.swingaccuracy=gs.swingpoint;
        gs.swingstage=4;
      }
      break;

    case 4: // Done - just show it on screen
      clearinputstate();

      console.log("Power "+gs.swingpower+" Accuracy "+gs.swingaccuracy);

      gs.txttimeline.reset();
      gs.txttimeline.add(0, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); write(gs.fxctx, 490, 200,"Fore", 20, "rgb(255,0,255)");});
      gs.txttimeline.add(1000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); write(gs.fxctx, 490, 200," Oh", 20, "rgb(255,0,255)");});
      gs.txttimeline.add(2000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); write(gs.fxctx, 490, 200,"Fore!", 20, "rgb(255,0,255)");});
      gs.txttimeline.add(3000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height);});
      gs.txttimeline.begin(1);

      gs.swingstage=1; // TODO remove later
      break;

    default:
      clearinputstate();
      gs.swingstage=0;
      break;
  }

  // Check for changing club
  if (gs.swingstage<2)
  {
    if (ispressed(2)) // Up
    {
      clearinputstate();

      if (gs.club>0)
        gs.club--;
    }
    else
    if (ispressed(8)) // Down
    {
      clearinputstate();

      if (gs.club<(gs.clubs.length-1))
        gs.club++;
    }
  }

  // Scoreboard
  if (ispressed(256)) // S
  {
    clearinputstate();

    if (gs.showscoreboard)
      gs.showscoreboard=false;
    else
      gs.showscoreboard=true;
  }
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
//      update();

      gs.acc-=gs.step;
    }
      update();
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

  // Play canvas
  gs.canvas.style.top=top+"px";
  gs.canvas.style.left=left+"px";

  gs.canvas.style.transformOrigin='0 0';
  gs.canvas.style.transform='scale('+(width/xmax)+')';

  // FX
  gs.fxcanvas.style.top=top+"px";
  gs.fxcanvas.style.left=left+"px";

  gs.fxcanvas.style.transformOrigin='0 0';
  gs.fxcanvas.style.transform='scale('+(width/xmax)+')';

  // HUD
  gs.hudcanvas.style.top=top+"px";
  gs.hudcanvas.style.left=left+"px";

  gs.hudcanvas.style.transformOrigin='0 0';
  gs.hudcanvas.style.transform='scale('+(width/xmax)+')';
}

/*
function oldgeneratecourse()
{
  var numsegments=Math.floor(rng()*(gs.hole/3))+14;
  var segment;
  var x=50;
  var y=10*(ymax/20);
  var w=100;
  var lastx=x;
  var lasty=y;
  var bias=0;
  var segments=[];

  // Trig
  var opp=0;
  var adj=0;
  var hyp=0;
  var theta=0;

  // 3D points
  var x1, y1, x2, y2, x3, y3, x4, y4=0;

  gs.offctx.clearRect(0, 0, gs.offcanvas.width, gs.offcanvas.height);

  gs.offctx.fillStyle="rgb(0,128,0)";
  gs.offctx.strokeStyle="rgb(0,128,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=w;

  console.log("v 0 0 0");
  console.log("v 0 0 0");

  gs.offctx.beginPath();

  // Calculate segments
  for (segment=0; segment<numsegments; segment++)
  {
    x+=(xmax/20);
    y=lasty+((Math.floor((rng()*2)+(rng()*bias)))*(ymax/20));

    w=Math.floor(100+(rng()*100));
w=200;
    gs.offctx.lineWidth=w;

    adj=x-lastx;
    opp=y-lasty;
    hyp=Math.sqrt((adj*adj)+(opp*opp));
    theta=Math.atan2(opp, adj)*180/Math.PI; // converted to degrees

    // x1,y1
    x1=Math.floor(lastx+(w*Math.cos(PIOVER180*(90+theta))));
    y1=Math.floor(lasty+(w*Math.sin(PIOVER180*(90+theta))));
    // x2,y2
    x2=Math.floor(lastx+(w*Math.cos(PIOVER180*(270+theta))));
    y2=Math.floor(lasty+(w*Math.sin(PIOVER180*(270+theta))));
    // x3,y3
    x3=Math.floor(x+(w*Math.cos(PIOVER180*(90+theta))));
    y3=Math.floor(y+(w*Math.sin(PIOVER180*(90+theta))));
    // x4,y4
    x4=Math.floor(x+(w*Math.cos(PIOVER180*(270+theta))));
    y4=Math.floor(y+(w*Math.sin(PIOVER180*(270+theta))));

    console.log("# ["+segment+"] x="+lastx+", y="+lasty+" -> x="+x+", y="+y+", w="+w);
    console.log("# ["+segment+"] adj="+adj+" opp="+opp+" hyp="+hyp+" theta="+theta);

//    console.log("v "+x1+" "+y1+" 0");
//    console.log("v "+x2+" "+y2+" 0");
    console.log("v "+x3+" "+y3+" 0");
    console.log("v "+x4+" "+y4+" 0");

    console.log("f -2 -1 -3");
    console.log("f -2 -3 -4");

    segments.push({x:x, y:y, w:w});

    if (segment==0)
      gs.offctx.moveTo(Math.floor(x), Math.floor(y));
    else
      gs.offctx.lineTo(Math.floor(x), Math.floor(y));

    gs.offctx.stroke();

    lastx=x;
    lasty=y;
    bias=(lasty>y?1:-1);
  }

  console.log("------------------------");

  // Draw all segment centre points
  for (segment=0; segment<numsegments; segment++)
  {
  gs.offctx.fillStyle="rgba(0,0,0,0.5)";
  gs.offctx.strokeStyle="rgba(0,0,0,0.5)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=50;

  gs.offctx.beginPath();
  gs.offctx.arc(segments[segment].x, segments[segment].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();
  }

  // Draw tee
  gs.offctx.fillStyle="rgb(255,0,0)";
  gs.offctx.strokeStyle="rgb(255,0,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(segments[0].x, segments[0].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw hole
  gs.offctx.fillStyle="rgb(0,0,0)";
  gs.offctx.strokeStyle="rgb(0,0,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(segments[segments.length-1].x, segments[segments.length-1].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Bend left or right

  // Length of course

  // Width of course

  // Green

  // Rough

  // Trees

  // Other greenery edges

  // Hazards - sand or water
}
*/

function generatecourse()
{
  var segment;
  var x=0;
  var y=10*(ymax/20);
  var w=200;
  var lastx=x;
  var lasty=y;
  var bias=0;
  var distance=0;
  var dx=0;
  var dy=0;

  // Clear segments for hole
  gs.course.segments=[];
  gs.course.numsegments=Math.floor(rng()*(gs.hole/3))+13;

  // Centre course in view
  x=(xmax/2)-((gs.course.numsegments*(xmax/20))/2);

  // Calculate segments
  for (segment=0; segment<gs.course.numsegments; segment++)
  {
    x+=(xmax/20);
    y=lasty+((Math.floor((rng()*2)+(rng()*bias)))*(ymax/20));

    gs.course.segments.push({x:x, y:y, w:w});

    lastx=x;
    lasty=y;
    bias=(lasty>y?1:-1);
  }

  gs.offctx.clearRect(0, 0, gs.offcanvas.width, gs.offcanvas.height);

  gs.offctx.fillStyle="rgb(0,98,0)";
  gs.offctx.strokeStyle="rgb(0,98,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=w*1.2;

  // Draw border
  gs.offctx.beginPath();
  for (segment=0; segment<gs.course.numsegments; segment++)
  {
    if (segment==0)
      gs.offctx.moveTo(Math.floor(gs.course.segments[segment].x), Math.floor(gs.course.segments[segment].y));
    else
      gs.offctx.lineTo(Math.floor(gs.course.segments[segment].x), Math.floor(gs.course.segments[segment].y));
  }
  gs.offctx.stroke();

  // Draw fairway
  gs.offctx.fillStyle="rgb(0,128,0)";
  gs.offctx.strokeStyle="rgb(0,128,0)";
  gs.offctx.lineWidth=w;

  gs.offctx.beginPath();
  for (segment=0; segment<gs.course.numsegments; segment++)
  {
    if (segment==0)
      gs.offctx.moveTo(Math.floor(gs.course.segments[segment].x), Math.floor(gs.course.segments[segment].y));
    else
      gs.offctx.lineTo(Math.floor(gs.course.segments[segment].x), Math.floor(gs.course.segments[segment].y));
  }
  gs.offctx.stroke();

  // Draw all segment centre points
  gs.offctx.fillStyle="rgba(0,0,0,0.05)";
  gs.offctx.strokeStyle="rgba(0,0,0,0.05)";
  gs.offctx.lineWidth=50;

  for (segment=0; segment<gs.course.numsegments; segment++)
  {
    gs.offctx.beginPath();
    gs.offctx.arc(gs.course.segments[segment].x, gs.course.segments[segment].y, 10, 0, 2*Math.PI);
    gs.offctx.fill();
  }

  // Draw tee
  gs.offctx.fillStyle="rgb(255,0,0)";
  gs.offctx.strokeStyle="rgb(255,0,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(gs.course.segments[0].x, gs.course.segments[0].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw green
  gs.offctx.fillStyle="rgb(0,180,0)";
  gs.offctx.strokeStyle="rgb(0,180,0)";

  gs.offctx.beginPath();
  gs.offctx.arc(gs.course.segments[gs.course.segments.length-1].x, gs.course.segments[gs.course.segments.length-1].y, w*0.2, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw hole
  gs.offctx.fillStyle="rgb(0,0,0)";
  gs.offctx.strokeStyle="rgb(0,0,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(gs.course.segments[gs.course.segments.length-1].x, gs.course.segments[gs.course.segments.length-1].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Length of course
  dx=Math.abs(gs.course.segments[gs.course.segments.length-1].x-gs.course.segments[0].x);
  dy=Math.abs(gs.course.segments[gs.course.segments.length-1].y-gs.course.segments[0].y);
  distance=Math.floor(Math.sqrt((dx*dx)+(dy*dy))*YARDSPERPIXEL);

  // Calculate par
  gs.par[gs.hole-1]=calculatepar(distance);

  // Rough

  // Trees

  // Other greenery edges

  // Hazards - sand or water
}

// Reset ball
function kick()
{
  gs.hole++;
  if (gs.hole>gs.holes) gs.hole=1;

  generatecourse();

  gs.ball.x=0;
  gs.ball.y=ymax;
  gs.ball.z=0;

  gs.ball.vx=4;
  gs.ball.vy=-8;
  gs.ball.vz=0;

  // Between -0.05 and +0.05
  gs.wind.vx=(rng()-0.5)*0.01;
}

// Clear both keyboard and gamepad input state
function clearinputstate()
{
  keystate=0;
  padstate=0;
}

// Check if an input is set in either keyboard or gamepad input state
function ispressed(keybit)
{
  return (((keystate&keybit)!=0) || ((padstate&keybit)!=0));
}

// Startup called once when page is loaded
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

  gs.ctx.fillStyle="rgb(255,255,255)";
  gs.ctx.strokeStyle="rgb(255,255,255)";
  gs.ctx.lineWidth=1;

  gs.offcanvas=document.createElement('canvas');
  gs.offcanvas.width=xmax;
  gs.offcanvas.height=ymax;
  gs.offctx=gs.offcanvas.getContext('2d');

  gs.fxcanvas=document.getElementById('fx');
  gs.fxcanvas.width=xmax;
  gs.fxcanvas.height=ymax;
  gs.fxctx=gs.fxcanvas.getContext('2d');

  gs.hudcanvas=document.getElementById('hud');
  gs.hudcanvas.width=xmax;
  gs.hudcanvas.height=ymax;
  gs.hudctx=gs.hudcanvas.getContext('2d');

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

  window.onmousedown=function(e)
  {
    keystate|=16;
    e.preventDefault();
  };

  window.onmouseup=function(e)
  {
    keystate&=~16;
    e.preventDefault();
  };

  // Put straight into game
  gs.state=2;

  generatecourse();
  window.requestAnimationFrame(rafcallback);

  gs.timeline.reset();
  gs.timeline.add(6000, function(){kick();});
  gs.timeline.begin(0);
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };

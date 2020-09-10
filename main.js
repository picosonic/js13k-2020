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
    vx:(rng()-0.5)*0.01,
    vy:0
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

  par:[1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
  strokes:[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],

  // Ball as shown on 2D course
  ballabove:{
    // Current position
    x:0,
    y:0,

    // Last position
    lastx:0,
    lasty:0
  },

  // Ball as shown side on (with physics)
  ballside:{
    // Current position
    x:0,
    y:ymax,

    // Velocity
    vx:0,
    vy:0
  },

  // Course data for all the holes
  courses:[],

  // Heading - direction of travel for ball when hit
  heading:90,

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
  state:0, // 0=title, 1=playing, 2=completed
  music:false
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
function strokeresult(hole)
{
  var strokes=gs.strokes[hole-1];
  var delta=strokes-gs.par[hole-1];

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
        return ""+Math.abs(delta)+((delta>0)?" over":" under")+" par";
      break;
  }
}

// Check if the ball is currently moving
function ballmoving()
{
  return ((Math.abs(gs.ballside.vx)>0.05) || (Math.abs(gs.ballside.vy)>0.05));
}

// Move the ball onwards
function moveball()
{
  var ax, bx, distance, ay, by;

  // Apply gravity
  if (gs.ballside.vy<gs.terminalvelocity)
    gs.ballside.vy+=gs.gravity;

  // Apply wind when off ground
  if (gs.ballside.y<ymax)
    gs.ballside.vx+=gs.wind.vx;

  // Slow ball down by air resistance or friction
  if (gs.ballside.vx>0)
  {
    if (gs.ballside.y<ymax)
      gs.ballside.vx-=gs.airresistance;
    else
      gs.ballside.vx-=gs.friction;

    // Stop it going backwards
    if (gs.ballside.vx<0)
      gs.ballside.vx=0;
  }

  gs.ballside.x+=gs.ballside.vx;
  gs.ballside.y+=gs.ballside.vy;

  // Stop it going off screen
  if (gs.ballside.x>xmax)
    gs.ballside.x=xmax;

  // Determine distance from hole in yards
  ax=Math.abs(gs.courses[gs.hole-1].segments[gs.courses[gs.hole-1].segments.length-1].x-gs.ballabove.x);
  ay=Math.abs(gs.courses[gs.hole-1].segments[gs.courses[gs.hole-1].segments.length-1].y-gs.ballabove.y);
  distance=Math.floor(Math.sqrt((ax*ax)+(ay*ay))*YARDSPERPIXEL);

  // When it hits the ground reverse to half it's vertical velocity
  if ((ballmoving()) && (gs.ballside.y>ymax))
  {
    if (gs.swingstage==0)
    {
      // Check what type of ground we hit
      var imagedata=gs.offctx.getImageData(gs.ballabove.x, gs.ballabove.y, 1, 1).data;
      if ((imagedata[0]==0) && (imagedata[1]==0) && (imagedata[2]==0) && (imagedata[3]==0))
      {
        // This is in the water, put ball back where it came from
        gs.ballabove.x=gs.ballabove.lastx;
        gs.ballabove.y=gs.ballabove.lasty;

        // Stop ball moving
        gs.ballside.vx=0;
        gs.ballside.vy=0;

        // Place physics ball at bottom corner
        gs.ballside.x=0;
        gs.ballside.y=ymax;

        // Loose a stroke
        gs.strokes[gs.hole-1]++;

        // Sploosh message
        gs.txttimeline.reset();
        gs.txttimeline.add(0, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); shadowwrite(gs.fxctx, 390, 200,"Sploosh", 20, "rgb(135,206,235)");});
        gs.txttimeline.add(1000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height);});
        gs.txttimeline.begin(1);

        return;
      }
      else
      if ((imagedata[0]==194) && (imagedata[1]==178) && (imagedata[2]==128))
      {
        // Stop ball moving
        gs.ballside.vx=0;
        gs.ballside.vy=0;

        // Place physics ball at bottom corner
        gs.ballside.x=0;
        gs.ballside.y=ymax;

        // Sand message
        gs.txttimeline.reset();
        gs.txttimeline.add(0, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); shadowwrite(gs.fxctx, 390, 200,"Sand Trap", 20, "rgb(194,178,128)");});
        gs.txttimeline.add(1000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height);});
        gs.txttimeline.begin(1);

        return;
      }

      // Check if it has hit the hole, if so allow a "gimme"
      if (distance<1)
      {
        gs.ballside.vx=0;
        gs.ballside.vy=0;
      }
    }

    gs.ballside.y=ymax;
    gs.ballside.vy=-(gs.ballside.vy*0.5);
  }

  // If ball is only moving a tiny bit - stop it
  if (!ballmoving())
  {
    gs.ballside.vx=0;
    gs.ballside.vy=0;

    if (gs.swingstage==0)
    {
      gs.swingstage=1;

      gs.strokes[gs.hole-1]++;

      // Change wind
      gs.wind.vx=(rng()-0.5)*0.01;

      if (distance<2)
        nexthole();
    }
  }

  // When side ball is moving, also move top down ball
  if (ballmoving())
  {
    ax=gs.ballabove.lastx;
    ay=gs.ballabove.lasty;

    distance=(gs.clubs[gs.club].dist/YARDSPERPIXEL)*(gs.ballside.x/xmax);
    bx=ax+(distance*Math.cos((gs.heading-90)*PIOVER180));
    by=ay+(distance*Math.sin((gs.heading-90)*PIOVER180));

    gs.ballabove.x=bx;
    gs.ballabove.y=by;
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
    if (gs.hole-1>=hole)
      write(gs.hudctx, cx+(80*hole), cy+120, gs.strokes[hole]==0?"-":""+(gs.strokes[hole]), 5, "rgba(128,255,128,0.9)");
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
    if (gs.hole-1>=hole)
      write(gs.hudctx, cx+(80*(hole-(gs.holes/2))), cy+120, gs.strokes[hole]==0?"-":""+(gs.strokes[hole]), 5, "rgba(128,255,128,0.9)");
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
  gs.hudctx.strokeStyle="rgba(5,5,255,0.9)";

  angle=Math.atan2(gs.wind.vy, gs.wind.vx)*180/Math.PI; // converted to degrees
  windspeed=Math.abs(Math.sqrt((gs.wind.vx*gs.wind.vx)+(gs.wind.vy*gs.wind.vy))*1000).toFixed(0);

  // Arrow
  gs.hudctx.beginPath();
  gs.hudctx.moveTo(cx+(40*Math.cos(angle)), cy+(40*Math.sin(angle)));
  gs.hudctx.lineTo(cx+(40*Math.cos(angle-160)), cy+(40*Math.sin(angle-160)));
  gs.hudctx.lineTo(cx+(40*Math.cos(angle+160)), cy+(40*Math.sin(angle+160)));
  gs.hudctx.lineTo(cx+(40*Math.cos(angle)), cy+(40*Math.sin(angle)));
  gs.hudctx.fill();
  gs.hudctx.stroke();

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

  gs.hudctx.lineWidth=2;

  gs.hudctx.fillRect(cx, cy, 150, 155);

  gs.hudctx.fillStyle="rgba(255,255,255,0.6)";
  gs.hudctx.strokeStyle="rgba(155,155,255,0.9)";

  // Calculate distance from ball to hole
  dx=Math.abs(gs.courses[gs.hole-1].segments[gs.courses[gs.hole-1].segments.length-1].x-gs.ballabove.x);
  dy=Math.abs(gs.courses[gs.hole-1].segments[gs.courses[gs.hole-1].segments.length-1].y-gs.ballabove.y);
  distance=Math.floor(Math.sqrt((dx*dx)+(dy*dy))*YARDSPERPIXEL);

  write(gs.hudctx, cx+15, cy+15, distance+" yds", 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, cx+15, cy+50, "Stroke "+(gs.strokes[gs.hole-1]+1), 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, cx+15, cy+85, "Par "+gs.par[gs.hole-1], 3, "rgba(255,255,255,0.7)");
  write(gs.hudctx, cx+15, cy+120, gs.clubs[gs.club].name, 3, "rgba(255,255,255,0.7)");
}

// Draw a line from ball position to target
function showheading()
{
  var ax, bx, distance, ay, by;

  gs.hudctx.save();

  gs.hudctx.strokeStyle="rgba(255,140,0,"+(((gs.lasttime%600))/600).toFixed(2)+")";
  gs.hudctx.lineWidth=10;

  ax=gs.ballabove.x;
  ay=gs.ballabove.y;

  distance=gs.clubs[gs.club].dist/YARDSPERPIXEL;
  bx=ax+(distance*Math.cos((gs.heading-90)*PIOVER180));
  by=ay+(distance*Math.sin((gs.heading-90)*PIOVER180));

  gs.hudctx.beginPath();
  gs.hudctx.moveTo(ax, ay);
  gs.hudctx.lineTo(bx, by);

  gs.hudctx.stroke();

  gs.hudctx.restore();
}

// Render the current scene
function render()
{
  switch (gs.state)
  {
    case 0: // Title
      // Clear the screen
      gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
      gs.offctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

      gs.hudctx.save();
      gs.hudctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);
      shadowwrite(gs.hudctx, 200, 20, "Coding Go f", 20, "rgba(255,255,255,0.9)");
      shadowwrite(gs.hudctx, 400, 200, "Broken Links", 10, "rgba(255,255,0,0.9)");
      shadowwrite(gs.hudctx, 180, 650, "Press Space/Enter/Gamepad/Mouse to play", 6, "rgba(255,255,0,"+(((gs.lasttime%1200))/1200).toFixed(2)+")");

      gs.hudctx.fillStyle="rgb(255,255,255)";
      gs.hudctx.strokeStyle="rgb(255,255,255)";
      gs.hudctx.lineCap="square";
      gs.hudctx.lineWidth=15;

      var holex=960;
      var holey=155;

      gs.hudctx.beginPath();
      gs.hudctx.moveTo(holex, holey);
      gs.hudctx.lineTo(holex, holey-110);
      gs.hudctx.stroke();

      gs.hudctx.fillStyle="rgb(255,0,0)";
      gs.hudctx.strokeStyle="rgb(255,0,0)";
      gs.hudctx.beginPath();
      gs.hudctx.moveTo(holex+7, holey-90);
      gs.hudctx.lineTo(holex+24, holey-97.5);
      gs.hudctx.lineTo(holex+7, holey-105);
      gs.hudctx.closePath();
      gs.hudctx.fill();
      gs.hudctx.stroke();
      gs.hudctx.restore();
      break;

    case 1: // In game
    case 2: // Completed
      // Clear the screen
      gs.ctx.clearRect(0, 0, gs.canvas.width, gs.canvas.height);

      // Draw the ball shadow
      gs.ctx.save();
      gs.ctx.fillStyle="rgba(0,0,0,0.2)";
      gs.ctx.strokeStyle="rgba(0,0,0,0.2)";
      gs.ctx.beginPath();
      gs.ctx.arc(Math.floor(gs.ballabove.x)+10+((1-(gs.ballside.y/ymax))*20), Math.floor(gs.ballabove.y)+10+((1-(gs.ballside.y/ymax))*20), 10, 0, 2*Math.PI);
      gs.ctx.fill();
      gs.ctx.restore();

      // Draw the ball
      gs.ctx.beginPath();
      gs.ctx.arc(Math.floor(gs.ballabove.x), Math.floor(gs.ballabove.y), 10+((1-(gs.ballside.y/ymax))*20), 0, 2*Math.PI);
      gs.ctx.fill();

      gs.hudctx.clearRect(0, 0, gs.hudcanvas.width, gs.hudcanvas.height);

      if (gs.showscoreboard)
      {
        scoreboard();
      }
      else
      {
        shadowwrite(gs.hudctx, 520, 10, "Hole "+gs.hole, 10, "rgba(255,255,0,0.9)");

        if (!ballmoving())
          showheading();

        if (gs.swingstage>0)
          swingmeter();

        windmeter();

        showinfobox();
      }
      break;

    default:
      gs.state=0;
      break;
  }

}

// Update step
function update()
{
  switch (gs.state)
  {
    case 0: // Title
      if (ispressed(16)) // Action
      {
        clearinputstate();

        // Stop the 3D renderer
        gsthreedee.stop();

        // Start game
        gs.state=1;

        // Set default heading
        gs.heading=90;

        // Draw current course
        drawcourse(gs.hole-1);
      }
      else
        return;
      break;

    case 1: // In game
      // Do nothing
      break;

    case 2: // Completed
      if (ispressed(16)) // Action
      {
        clearinputstate();

        // Return to title screen
        gsthreedee.start();
        gs.state=0;
      }
      else
        return;
      break;

    default:
      gsthreedee.start();
      gs.state=0;
      break;
  }

  if (gs.showscoreboard)
  {
    if ((ispressed(256)) // S
      || (ispressed(16))) // Action
    {
      clearinputstate();

      gs.showscoreboard=false;
    }

    return;
  }

  // Move the ball
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

    case 4: // Done - strike the ball
      clearinputstate();

      // Cache position when hit
      gs.ballabove.lastx=gs.ballabove.x;
      gs.ballabove.lasty=gs.ballabove.y;

      // Determine heading
      if (gs.swingaccuracy>5) // Hook
        gs.heading+=(rng()*2.5);

      if (gs.swingaccuracy<0) // Slice
        gs.heading-=(rng()*2.5);

      if (gs.swingpower>100) // If overhit randomise heading +/- 5%
        gs.heading+=((rng()*10)-5);

      // Determine swing power
      gs.ballside.vx=2.5*(gs.swingpower/70);

      // Determine loft
      gs.ballside.vy=-8*(gs.swingpower/70);

      // If we're in sand, then further randomise some values
      var imagedata=gs.offctx.getImageData(gs.ballabove.x, gs.ballabove.y, 1, 1).data;
      if ((imagedata[0]==194) && (imagedata[1]==178) && (imagedata[2]==128))
      {
        // Alter heading by up to +/- 10%
        gs.heading+=((rng()*20)-10);

        // Reduce horizontal power
        gs.ballside.vx*=(0.5-(rng()*0.25));
      }

      // Start side ball from bottom left
      gs.ballside.x=0;
      gs.ballside.y=ymax;

      gs.txttimeline.reset();
      gs.txttimeline.add(0, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); shadowwrite(gs.fxctx, 490, 200,"Fore", 20, "rgb(255,255,255)");});
      gs.txttimeline.add(1000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); shadowwrite(gs.fxctx, 490, 200," Oh", 20, "rgb(255,255,255)");});
      gs.txttimeline.add(2000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); shadowwrite(gs.fxctx, 490, 200,"Fore!", 20, "rgb(255,255,255)");});
      gs.txttimeline.add(3000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height);});
      gs.txttimeline.begin(1);

      gs.swingstage=0;
      break;

    default:
      clearinputstate();
      gs.swingstage=0;
      break;
  }

  // Check for changing club and rotating heading
  if (gs.swingstage==1)
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

    // Heading rotation
    if (ispressed(1)) // Left
    {
      // Anti-clockwise
      gs.heading-=0.8;
    }
    else
    if (ispressed(4)) // Right
    {
      // Clockwise
      gs.heading+=0.8;
    }

    // Normalise heading
    if (gs.heading>=360) gs.heading-=360;
    if (gs.heading<0) gs.heading=360-gs.heading;
  }

  // Scoreboard
  if (ispressed(256)) // S
  {
    clearinputstate();

    gs.showscoreboard=true;
  }
}

// Called once per frame for animation updates
function rafcallback(timestamp)
{
  // Apparently gamepad support only now works via https
  //   see https://hacks.mozilla.org/2020/07/securing-gamepad-api/
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
      gs.acc-=gs.step;

    update();
  }

  // Remember when we were last called
  gs.lasttime=timestamp;

  // Perform a render step
  render();

  // Request we are called on next frame
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

  // Course canvas
  gs.offcanvas.style.top=top+"px";
  gs.offcanvas.style.left=left+"px";

  gs.offcanvas.style.transformOrigin='0 0';
  gs.offcanvas.style.transform='scale('+(width/xmax)+')';

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

  // 3D
  gs.d3canvas.style.top=top+"px";
  gs.d3canvas.style.left=left+"px";

  gs.d3canvas.style.transformOrigin='0 0';
  gs.d3canvas.style.transform='scale('+(width/xmax)+')';
}

function generatecourses()
{
  var x, y, w, lastx, lasty, bias, distance, dx, dy;

  for (var hole=0; hole<gs.holes; hole++)
  {
    x=0;
    y=10*(ymax/20);
    w=200;
    lastx=x;
    lasty=y;
    bias=0;

    // Create data structue if needed
    if (gs.courses[hole]==undefined)
      gs.courses[hole]={segments:[], numsegments:0, w:w};

    // Clear segments for hole
    gs.courses[hole].segments=[];
    gs.courses[hole].numsegments=Math.floor(rng()*(hole/3))+13;

    // Centre course in view
    x=(xmax/2)-((gs.courses[hole].numsegments*(xmax/20))/2);

    // Calculate segments
    for (var segment=0; segment<gs.courses[hole].numsegments; segment++)
    {
      x+=(xmax/20);
      y=lasty+((Math.floor((rng()*2)+(rng()*bias)))*(ymax/20));

      gs.courses[hole].segments.push({x:x, y:y, w:w});

      lastx=x;
      lasty=y;
      bias=(lasty>y?1:-1);
    }

    // Length of course
    dx=Math.abs(gs.courses[hole].segments[gs.courses[hole].segments.length-1].x-gs.courses[hole].segments[0].x);
    dy=Math.abs(gs.courses[hole].segments[gs.courses[hole].segments.length-1].y-gs.courses[hole].segments[0].y);
    distance=Math.floor(Math.sqrt((dx*dx)+(dy*dy))*YARDSPERPIXEL);

    // Calculate par
    gs.par[hole]=calculatepar(distance);
  }
}

function drawcourse(hole)
{
  var segment=0;

  gs.offctx.clearRect(0, 0, gs.offcanvas.width, gs.offcanvas.height);

  gs.offctx.lineCap="round";

  // Draw outer border
  gs.offctx.save();
  gs.offctx.fillStyle="rgb(0,78,0)";
  gs.offctx.strokeStyle="rgb(0,78,0)";
  gs.offctx.shadowColor="rgba(0,0,0,0.1)";
  gs.offctx.shadowOffsetX=15;
  gs.offctx.shadowOffsetY=15;
  gs.offctx.lineWidth=gs.courses[hole].w*1.25;
  gs.offctx.beginPath();
  for (segment=0; segment<gs.courses[hole].numsegments; segment++)
  {
    if (segment==0)
      gs.offctx.moveTo(Math.floor(gs.courses[hole].segments[segment].x), Math.floor(gs.courses[hole].segments[segment].y));
    else
      gs.offctx.lineTo(Math.floor(gs.courses[hole].segments[segment].x), Math.floor(gs.courses[hole].segments[segment].y));
  }
  gs.offctx.stroke();

  // Draw inner border
  gs.offctx.fillStyle="rgb(0,98,0)";
  gs.offctx.strokeStyle="rgb(0,98,0)";
  gs.offctx.shadowOffsetX=5;
  gs.offctx.shadowOffsetY=5;
  gs.offctx.lineWidth=gs.courses[hole].w*1.15;
  gs.offctx.beginPath();
  for (segment=0; segment<gs.courses[hole].numsegments; segment++)
  {
    if (segment==0)
      gs.offctx.moveTo(Math.floor(gs.courses[hole].segments[segment].x), Math.floor(gs.courses[hole].segments[segment].y));
    else
      gs.offctx.lineTo(Math.floor(gs.courses[hole].segments[segment].x), Math.floor(gs.courses[hole].segments[segment].y));
  }
  gs.offctx.stroke();

  // Draw fairway
  gs.offctx.fillStyle="rgb(0,128,0)";
  gs.offctx.strokeStyle="rgb(0,128,0)";
  gs.offctx.lineWidth=gs.courses[hole].w;

  gs.offctx.beginPath();
  for (segment=0; segment<gs.courses[hole].numsegments; segment++)
  {
    if (segment==0)
      gs.offctx.moveTo(Math.floor(gs.courses[hole].segments[segment].x), Math.floor(gs.courses[hole].segments[segment].y));
    else
      gs.offctx.lineTo(Math.floor(gs.courses[hole].segments[segment].x), Math.floor(gs.courses[hole].segments[segment].y));
  }
  gs.offctx.stroke();
  gs.offctx.restore();

  // Draw all segment centre points
  gs.offctx.fillStyle="rgba(0,0,0,0.05)";
  gs.offctx.strokeStyle="rgba(0,0,0,0.05)";
  gs.offctx.lineWidth=50;

  for (segment=0; segment<gs.courses[hole].numsegments; segment++)
  {
    gs.offctx.beginPath();
    gs.offctx.arc(gs.courses[hole].segments[segment].x, gs.courses[hole].segments[segment].y, 10, 0, 2*Math.PI);
    gs.offctx.fill();
  }

  // Draw tee
  gs.offctx.fillStyle="rgb(255,0,0)";
  gs.offctx.strokeStyle="rgb(255,0,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(gs.courses[hole].segments[0].x, gs.courses[hole].segments[0].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw green
  gs.offctx.fillStyle="rgb(0,180,0)";
  gs.offctx.strokeStyle="rgb(0,180,0)";

  gs.offctx.beginPath();
  gs.offctx.arc(gs.courses[hole].segments[gs.courses[hole].segments.length-1].x, gs.courses[hole].segments[gs.courses[hole].segments.length-1].y, gs.courses[hole].w*0.2, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw hole
  gs.offctx.fillStyle="rgb(0,0,0)";
  gs.offctx.strokeStyle="rgb(0,0,0)";
  gs.offctx.lineCap="round";
  gs.offctx.lineWidth=100;

  gs.offctx.beginPath();
  gs.offctx.arc(gs.courses[hole].segments[gs.courses[hole].segments.length-1].x, gs.courses[hole].segments[gs.courses[hole].segments.length-1].y, 10, 0, 2*Math.PI);
  gs.offctx.fill();

  // Draw flag
  gs.offctx.fillStyle="rgb(255,255,255)";
  gs.offctx.strokeStyle="rgb(255,255,255)";
  gs.offctx.lineCap="square";
  gs.offctx.lineWidth=5;

  var holex=gs.courses[hole].segments[gs.courses[hole].segments.length-1].x;
  var holey=gs.courses[hole].segments[gs.courses[hole].segments.length-1].y;

  gs.offctx.beginPath();
  gs.offctx.moveTo(holex, holey);
  gs.offctx.lineTo(holex, holey-20);
  gs.offctx.stroke();

  gs.offctx.fillStyle="rgb(255,0,0)";
  gs.offctx.strokeStyle="rgb(255,0,0)";
  gs.offctx.beginPath();
  gs.offctx.moveTo(holex, holey-20);
  gs.offctx.lineTo(holex+8, holey-22.5);
  gs.offctx.lineTo(holex, holey-25);
  gs.offctx.closePath();
  gs.offctx.fill();
  gs.offctx.stroke();

  // Add random sand trap
  if (rng()<0.66)
  {
    gs.offctx.fillStyle="rgb(194,178,128)";
    gs.offctx.strokeStyle="rgb(194,178,128)";
    gs.offctx.lineCap="round";
    gs.offctx.lineWidth=100;

    gs.offctx.beginPath();
    gs.offctx.arc(gs.courses[hole].segments[gs.courses[hole].segments.length-2].x, gs.courses[hole].segments[gs.courses[hole].segments.length-2].y, 20+(rng()*10), 0, 2*Math.PI);
    gs.offctx.fill();
  }

  // Set initial ball position to be at tee
  gs.ballabove.x=gs.courses[hole].segments[0].x;
  gs.ballabove.y=gs.courses[hole].segments[0].y;
}

// Reset ball
function nexthole()
{
  var resulttxt=strokeresult(gs.hole);
  gs.showscoreboard=true;

  gs.txttimeline.reset();
  gs.txttimeline.add(0, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height); gs.fxctx.fillStyle="rgba(0,0,0,0.6)"; gs.fxctx.fillRect(0, 0, gs.hudcanvas.width, gs.hudcanvas.height);shadowwrite(gs.fxctx, (xmax/2)-((resulttxt.length/2)*(20*4)), 200,resulttxt, 20, "rgb(255,255,255)");});
  gs.txttimeline.add(2000, function(){gs.fxctx.clearRect(0, 0, gs.fxcanvas.width, gs.fxcanvas.height);});
  gs.txttimeline.begin(1);

  gs.hole++;
  if (gs.hole>gs.holes)
  {
    gs.hole=1;
    // TODO END OF GAME
  }

  // Draw the new course
  drawcourse(gs.hole-1);

  // Reset club to driver
  gs.club=0;
  gs.heading=90;

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
  gs.canvas=document.getElementById('canvas');
  gs.ctx=gs.canvas.getContext('2d');

  gs.ctx.fillStyle="rgb(255,255,255)";
  gs.ctx.strokeStyle="rgb(255,255,255)";
  gs.ctx.lineWidth=1;

  gs.offcanvas=document.getElementById('course');
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

  gs.d3canvas=document.getElementById('threedee');
  gs.d3canvas.width=xmax;
  gs.d3canvas.height=ymax;
  gs.d3ctx=gs.d3canvas.getContext('2d');

  resize();
  window.addEventListener("resize", resize);

  document.onkeydown=function(e)
  {
    e = e || window.event;

    updatekeystate(e, 1);

    if (gs.music==false)
    {
      gs.music=true;
      music_play();
    }
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

    if (gs.music==false)
    {
      gs.music=true;
      music_play();
    }
  };

  window.onmouseup=function(e)
  {
    keystate&=~16;
    e.preventDefault();
  };

  window.onwheel=function(e)
  {
    gs.heading+=e.deltaY;
    e.preventDefault();
  };

  // Generate all the courses
  generatecourses();

  window.requestAnimationFrame(rafcallback);

  // Initialise 3D engine
  threedeeinit();
  gsthreedee.start();
}

// Run the startup() once page has loaded
window.onload=function() { startup(); };

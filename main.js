// Global constants
const xmax=1280;
const ymax=720;

// Game state is global to prevent it going out of scope
var gs={
  canvas:null,
  ctx:null
};

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

  resize();
  window.addEventListener("resize", resize);
}

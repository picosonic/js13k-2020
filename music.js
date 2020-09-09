var music={
  audioCtx:null,
  gainNode:null,
  panNode:null,
  f:[],
  notelen:(1/6) // ~166ms
};

function music_init()
{
  try
  {
    const AudioContext=window.AudioContext || window.webkitAudioContext;
    music.audioCtx=new AudioContext();

    // Add volume control
    music.gainNode=music.audioCtx.createGain();
    music.gainNode.connect(music.audioCtx.destination);
    music.gainNode.gain.setValueAtTime(0.012, music.audioCtx.currentTime);

    // Add audio panning
    music.panNode=music.audioCtx.createStereoPanner();
    music.panNode.connect(music.gainNode);

    // Load up song
    music.f=[
      [161,4],[169,5],[177,6],[137,7],[149,8],[157,9],[161,10],[129,11],[141,12],[149,13],[157,14],[121,15],[121,16],[141,17],[121,18],[121,20],[125,21],[129,22],[161,23],[129,24],[133,25],[137,26],[161,27],[157,28],[141,29],[157,30],[169,31],[169,32],[157,34],[161,36],[169,37],[177,38],[137,39],[149,40],[157,41],[161,42],[129,43],[141,44],[149,45],[157,46],[121,47],[121,48],[117,49],[121,50],[129,51],[137,52],[141,53],[145,54],[149,55],[157,56],[149,57],[141,58],[177,59],[169,60],[169,64],[157,66],[161,68],[169,69],[177,70],[137,71],[149,72],[157,73],[161,74],[129,75],[141,76],[149,77],[157,78],[121,79],[121,80],[141,81],[121,82],[121,84],[125,85],[129,86],[161,87],[129,88],[133,89],[137,90],[161,91],[157,92],[141,93],[157,94],[169,95],[169,96],[157,100],[161,101],[169,102],[129,103],[145,104],[149,105],[157,106],[129,107],[149,108],[145,109],[149,110],[157,111],[161,112],[165,114],[169,116],[189,117],[169,118],[157,119],[141,120],[121,121],[137,122],[169,123],[141,124],[141,128],[157,130],

      [53,4],[89,6],[25,8],[89,10],[45,12],[93,14],[25,16],[93,18],[41,20],[89,22],[25,24],[101,26],[45,28],[93,30],[61,32],[93,34],[53,36],[89,38],[25,40],[89,42],[45,44],[93,46],[49,48],[85,50],[53,52],[89,54],[49,56],[101,58],[101,60],[49,61],[53,62],[25,64],[53,68],[89,70],[25,72],[89,74],[45,76],[93,78],[25,80],[93,82],[41,84],[89,86],[25,88],[101,90],[45,92],[93,94],[61,96],[93,98],[81,100],[97,102],[73,104],[93,106],[65,108],[81,110],[33,112],[33,114],[73,116],[93,118],[73,120],[89,122],[45,124],[73,126],[61,128]
    ];
  }

  catch (e) {}
}

function music_play()
{
  try
  {
    // Inspired by https://github.com/xem/miniMusic

    // Do the init if it hasn't been done already
    if (music.audioCtx==null)
      music_init();

    // Process all the notes in the song
    for (var i in music.f)
    {
      var e=music.audioCtx.currentTime+(music.f[parseInt(i,10)][1]*music.notelen);
      var osc=music.audioCtx.createOscillator();

      // Pan the note to where it would sound like if played on a piano
      osc.connect(music.panNode);
      music.panNode.pan.setValueAtTime(((music.f[parseInt(i,10)][0]/245)*2)-1, e);

      osc.type='triangle';

      // Convert the note from BBC Micro "pitch" to frequency in Hz
      osc.frequency.value=65.41*Math.pow(2, ((music.f[parseInt(i,10)][0]-5)/4)/12);

      // Set the start and stop times for the oscillator
      osc.start(e);
      osc.stop(e+music.notelen);
    }

    setTimeout(music_play, (music.notelen*1000)*(128));
  }

  catch (e) {}
}

# Dev Diary / Postmortem

**Coding Golf - Broken Links**

This was my third game jam entry, and my fourth HTML5/JS game. My first from JS13k 2018 is available here [Planet Figadore has gone OFFLINE](https://github.com/picosonic/js13k-2018) and my second from JS13k 2019 is available here [BACKSPACE - Return to planet Figadore](https://github.com/picosonic/js13k-2019).

As in previous years, just before the theme was announced I created a new project template with updated build and minify steps from my entry last year.

Once the theme was announced I had a bit of a thought about the kind of game I could create to fit the theme, these are some of my initial notes/ideas ..

404 as numbers
--------------
* hex is 0x194
* octal is 624
* Roman numerals is CDIV
* The year 404 AD was Chinese year of water rabbit into wood dragon
* 404 AD was the year of last known gladiator fight in Rome
* 404 AD was a leap year starting on Friday (Julian calendar)
* 404 years ago was 1616, this was also leap year starting on Friday (Gregorian calendar)

404 as words based on "not found"
---------------------------------
* absent
* invisible
* misplaced
* away
* missing
* removed
* vanished

Game ideas
----------
* Golf game - A nod to [code golfing](https://en.wikipedia.org/wiki/Code_golf), maybe call the course "Missing Links". With procedural (based on predictable RNG) trees / landscapes / hills. Maybe using [Simplex](https://en.wikipedia.org/wiki/Simplex_noise)/[Perlin noise](https://en.wikipedia.org/wiki/Perlin_noise). Some 3D gravity/acceleration with wind and other hazards.
* Driving game - Always wanted to do a driving game. Some kind of race or chase to get a missing trophy back. With procedural buildings / scenery. Power-ups and boosts.
* Treasure hunting island hopping platformer - I've previously made a [2D platformer](https://github.com/picosonic/js13k-2018), I like the idea of having multiple islands where you need to solve a puzzle to move to the next island. 
* Ninja heist game - Where you need to break in to a fortress to retrive a stolen artefact. The ninja can become invisble using scenery to hide in plain sight from guards. Some fighting required when spotted.
* Flight sim - A low res 3D flying simulator. Things keep getting misplaced, and you need to fly around searching for them to return them to their owners. Possibly helicopter based (would make landings easier), or there is an aeroplane called the [Martin 4-0-4](https://en.wikipedia.org/wiki/Martin_4-0-4).

Here is a rough diary of progress as posted on [Twitter](https://twitter.com/femtosonic) and taken from notes and [commit logs](https://github.com/picosonic/js13k-2020/commits/)..

13th August
-----------
Just getting some game ideas together before starting to do coding experiments.

14th August
-----------
Decided there will be some aspect of predictable random number generation in my game. I liked reading the blog about [Wichmann-Hill RNG](https://en.wikipedia.org/wiki/Wichmann%E2%80%93Hill) being used by [Sploosh Kaboom](https://www.youtube.com/watch?v=1hs451PfFzQ) mini game in GC [The Legend of Zelda: The Wind Waker](https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_The_Wind_Waker) and decided to implement it in JS.

15th August
-----------
Decided to go with my first idea of a golf game for my JS13k game so have been learning golf terms/jargon and mechanics in preparation. Playing a few rounds of [Everybody's Golf](https://en.wikipedia.org/wiki/Everybody%27s_Golf_Portable) on the [Sony PSP](https://en.wikipedia.org/wiki/PlayStation_Portable). Going to name my game **"Coding Golf - Broken Links"**.

16th August
-----------
Added default styling, canvas, gamestate and startup code. Also fixed display area to 1280x720 resolution with auto resizing to fill the available area but keeping the resolution and aspect ratio (this adds black bars when the aspect ratio doesn't match). I may detect portrait and rotate as appropriate for mobile oplay.

17th August
-----------
Golf ball is moving along nicely. Affected by gravity, air resistance and friction. Next to add random(ish) wind, then on to terrain generation.

18th August
-----------
Added some basic wind processing.

19th August
-----------
Playing about with ideas for the course genertor.

20th August
-----------
More work on course generator.

21st August
-----------
Added representation of tee and hole to course generator. Added keyboard and gamepad libraries.

22nd August
-----------
Added a basic golf swing meter. Key to start, then again to select power percentage, finally one more press to determine accuracy (hook / perfect / slice).
Did some research into different golf clubs including optimal distance and typical loft values.

23rd August
-----------
Added 8bit font and writer for canvas. Filter out keyboard repeats. Reduced speed of failed power selection on swing meter.

24th August
-----------
Improved pixel spacings of rendered text. Added scale/club max distance to swing meter. Reduced swing speed. Allow <0% and >100% on swing meter. Reset power/accuracy on each swing. Draw position of selected power on swing meter. Allow changing club. Show selected club name.

25th August
-----------
Added writing text with shadow. More work on course generator. Added timeline library, which I've extended to include looping. Stop wind affecting ball when it's on the ground.

26th August
-----------
Added wind direction and speed indcators.

27th August
-----------
Added golf ball 3D model.

28th August
-----------
Added golf club and golf flag 3D models based on kenney.nl models. Added "Fore Oh Fore" upon hit.

2nd September
-------------
Decided each hole will be on an island and therefore is surrounded by a water hazard. Wind now has a 3D vector. Attempted to convert 2D generated course into 3D.

3rd September
-------------
Added scoreboard.

4th September
-------------
More work on scoreboard.

7th September
-------------
Centered course in view. Added stroke result text, e.g. Birdie/Bogey/Eagle/Hole-In-One, e.t.c. Cache generated course segments. Calculate par. Added info box. Make green visible. Show heading. Added rotation of heading. Add random heading change +/- 5% on overhit. Determine heading adjustments based on swingmeter. Hide swingmeter when struck.

8th September
-------------
Ball position now separated into top down and side on views. Ball now moves on topdown course. Ball size adjusts when in flight. Detect ball going in (or very near hole) to move on to next course. Generate all holes at init. Separated generating and drawing of holes. Handle drop in water. Don't display scores on scoreboard for holes yet to play. Don't redraw course on every frame.

9th September
-------------
Added music (may become annoying). Double heading rotation speed. Don't allow swing meter interaction whilst scoreboard is showing. Added terrain and ball shadows. Added flag and sand traps. Allow ball to plop into hole rather than only rolling in. Change wind direction between each shot. Title screen and game states. Mouse wheel rotates heading.

10th September
--------------
Added a second piece of music to break the monotony. Testing gamepads (felt cute might remove later). Added 3D engine code inspired by a [tutorial](https://www.youtube.com/watch?v=XgMWc6LumG4) from Javidx9.

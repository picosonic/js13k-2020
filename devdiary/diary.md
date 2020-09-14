# Dev Diary / Postmortem

![Coding Golf - Broken Links](../big_screenshot.png?raw=true "Coding Golf - Broken Links")

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
![Sploosh Kaboom](sploosh.png?raw=true "Sploosh Kaboom")

Decided there will be some aspect of predictable random number generation in my game. I liked reading the blog about [Wichmann-Hill RNG](https://en.wikipedia.org/wiki/Wichmann%E2%80%93Hill) being used by [Sploosh Kaboom](https://www.youtube.com/watch?v=1hs451PfFzQ) mini game in GC [The Legend of Zelda: The Wind Waker](https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_The_Wind_Waker) and decided to [implement it in JS](https://github.com/picosonic/js13k-2020/blob/master/wichmann-hill_rng.js).

15th August
-----------
![Golf](golf.png?raw=true "Golf")

Decided to go with my first idea of a golf game for my JS13k game so have been [learning golf terms/jargon and mechanics](https://github.com/picosonic/js13k-2020/blob/master/devdiary/notes.md) in preparation. Playing a few rounds of [Everybody's Golf](https://en.wikipedia.org/wiki/Everybody%27s_Golf_Portable) on the [Sony PSP](https://en.wikipedia.org/wiki/PlayStation_Portable). Going to name my game **"Coding Golf - Broken Links"**.

16th August
-----------
Added default styling, canvas, gamestate and startup code. Also fixed display area to 1280x720 resolution with auto resizing to fill the available area but keeping the resolution and aspect ratio (this adds black bars when the aspect ratio doesn't match). I may detect portrait and rotate as appropriate for mobile play.

17th August
-----------
![Ball flight](whack.gif?raw=true "Golf ball in flight")

Golf ball is moving along nicely. Affected by gravity, air resistance and friction. Next to add random(ish) wind, then on to terrain generation. Shown above is the side-on physics view, I also ended up doing a top-down representation using the positioning from the physics ball.

18th August
-----------
Added some basic wind processing. This is to blow the player's ball off course slightly so add a small level of difficulty.

19th August
-----------
![Maths](maths.png?raw=true "Converting 2D course to 3D")

Playing about with ideas for the course generator. I want to convert the 2D courses into a 3D representaion which can be navigated in 3D. Trying to work out all the maths involved in generating the 3D meshes.

20th August
-----------
More work on course generator.

21st August
-----------
At this point I was having a lot of difficulty with the 2D to 3D conversion and so decided to stick with 2D for now so that I could concentrate on adding the rest of the gameplay, with a thought to come back to 3D later on if I felt there was enough time. Added representation of tee and hole to course generator. Added keyboard and gamepad libraries from my previous JS13k gamejam entries.

22nd August
-----------
![Swing meter](swing.gif?raw=true "Swing meter")

Added a basic golf swing meter. Key to start, then again to select power percentage, finally one more press to determine accuracy (hook / perfect / slice).
Did some research into different golf clubs including optimal distance and typical loft values.

23rd August
-----------
Added 8bit font and writer (from my 2018 JS13k entry), updated for canvas. Filter out keyboard repeats. Reduced speed of failed power selection on swing meter.

24th August
-----------
Improved pixel spacings of rendered text. Added scale/club max distance to swing meter. Reduced swing speed. Allow <0% and >100% on swing meter. Reset power/accuracy on each swing. Draw position of selected power on swing meter. Allow changing club. Show selected club name.

25th August
-----------
Added writing text with shadow. More work on course generator. Added timeline library (from my 2018 JS13k entry), which I've extended to include looping. Stop wind affecting ball when it's on the ground.

26th August
-----------
Added wind direction and speed indicators to HUD.

27th August
-----------
![Golf ball](coriolis.gif?raw=true "Golf ball 3D model")

"THAT'S NO MOON". Created my first 3D model of a golf ball. This is a low poly cuboctahedron, aka Coriolis Space Station (inspried by BBC Micro game Elite).

28th August
-----------
![Golf club](club.gif?raw=true "Golf club 3D model")

At the half way point now. Added golf club and golf flag 3D models based on [kenney.nl](https://kenney.nl/assets/minigolf-kit) models. Added "Fore Oh Fore" upon hit.

2nd September
-------------
Decided each hole will be on an island and therefore is surrounded by a water hazard. Wind now has a 3D vector. Further attempts to convert 2D generated course into 3D aren't much better so ditched 3D courses.

3rd September
-------------
Added scoreboard to be shown between each hole.

4th September
-------------
More work on scoreboard.

7th September
-------------
Centered course horizontally in view so that short courses aren't bunched up on the left. Added stroke result text, e.g. Birdie/Bogey/Eagle/Hole-In-One, e.t.c. Cache generated course segments. Calculate par. Added info box. Make green visible. Show heading. Added rotation of heading. Add random heading change +/- 5% on overhit. Determine heading adjustments based on swingmeter. Hide swingmeter when struck.

8th September
-------------
Ball position now separated into top down and side on views. Ball now moves on topdown course. Ball size adjusts when in flight (based on height). Detect ball going in (or very near hole) to move on to next course. Generate all holes at init, so the par values can be calculated for scoreboard. Separated generating and drawing of holes. Handle drop in water with a SPLOOSH message, ball replaced where struck and stoke counted. Don't display scores on scoreboard for holes yet to play. Don't redraw course on every frame - I think this was causing slower performance.

9th September
-------------
Added looping music, which may become annoying as it's quite short, based on "The Chrysanthemum" by Scott Joplin as used in BBC Micro game Repton 1. Double heading rotation speed as it feels a bit slow. Don't allow swing meter interaction whilst scoreboard is showing. Added terrain and ball shadows. Added flag and random sand traps. Allow ball to plop into hole rather than only rolling in. Change wind direction between each shot. Title screen and game states. To allow playing with the mouse, the mouse wheel now rotates heading.

10th September
--------------
Added a second piece of music, "Black & White Rag" by George Botsford as used in BBC Micro game Repton 2, to break the monotony. Testing gamepads (felt cute might remove later). Added 3D engine code inspired by a [tutorial](https://www.youtube.com/watch?v=XgMWc6LumG4) from Javidx9, which I previously created a [JS library](https://github.com/picosonic/js3dengine) for. Made background a radial gradient. Added back story and controls to README. Added colour to faces of 3D models. Handle end of game better.

11th September
--------------
Centred course in view vertically.

![Trophies](trophies.png?raw=true "OS13k trophies")

Added trophies via OS13k.

![Trophy profile](../trophy.png?raw=true "2D trophy profile")

Added 3D model generation using 2D profiles, based on [Solids of Revolution](https://en.wikipedia.org/wiki/Solid_of_revolution) code found in [Beebug magazine](http://8bs.com/beebugmags.htm) Vol.8 No.7 from December 1989.

Submitted to JS13k 2020 competition as [Coding Golf - Broken Links](http://js13kgames.com/entries/coding-golf-broken-links).

# Dev Diary / Postmortem

**UNTITLED**

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
* Golf game - A nod to code golfing, maybe call the course "Missing Links". With procedural (based on predictable RNG) trees / landscapes / hills. Maybe using Simplex/Perlin noise. Some 3D gravity/acceleration with wind and other hazards.
* Driving game - Always wanted to do a driving game. Some kind of race or chase to get a missing trophy back. With procedural buildings / scenery. Power-ups and boosts.
* Treasure hunting island hopping platformer - I've previously made a 2d platformer, I like the idea of having multiple islands where you need to solve a puzzle to move to the next island. 
* Ninja heist game - Where you need to break in to a fortress to retrive a stolen artefact. The ninja can become invisble using scenery to hide in plain sight from guards. Some fighting required when spotted.
* Flight sim - A low res 3d flying simulator. Things keep getting misplaced, and you need to fly around searching for them to return them to their owners. Possibly helicopter based (would make landings easier), or there is an aeroplane called the Martin 4-0-4.

Here is a rough diary of progress as posted on [Twitter](https://twitter.com/femtosonic) and taken from notes and [commit logs](https://github.com/picosonic/js13k-2020/commits/)..

13th August
-----------
Just getting some game ideas together before starting to do coding experiments.

14th August
-----------
Decided there will be some aspect of predictable random number generation in my game. I liked reading the blog about [Wichmann-Hill RNG](https://en.wikipedia.org/wiki/Wichmann%E2%80%93Hill) being used by [Sploosh Kaboom](https://www.youtube.com/watch?v=1hs451PfFzQ) and decided to implement it in JS.

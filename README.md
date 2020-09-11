# js13k-2020
JS13KGames entry for 2020, theme is "**404 THEME (NOT) FOUND**".

## Coding Golf - Broken Links

![Coding Golf - Broken Links](big_screenshot.png?raw=true "Coding Golf - Broken Links")

With planet Figadore ravaged by the Regulith virus, all sporting events have been cancelled. Determined to play a round of golf, Fred sneaks on to the "Coding Golf" island golfcourse where he works, to play a game.

Your mission is to help Fred get the lowest score possible on each hole so that he can win the "Broken Links" championship trophy.

Use the left/right cursor keys to rotate the direction the ball will be struck in, then select a golf club using the up/down arrows to adjust the range. Once you're happy, press SPACE/ENTER to start the swing meter. Then pressing SPACE/ENTER a second time will select a strike power (as a percentage), the meter will now move back towards 0. You then need to press SPACE/ENTER a final time as close to 0 as you can to prevent a hooked or sliced shot.

Alternatively you can use a mouse to play, scroll wheel will rotate the ball direction, then click for each step of the swing meter operation.

A scoreboard is shown after each hole is completed. There are 18 holes in total.

# Stuff I managed to add
* 2D top down golf game
* Full screen, but landscape with target 720p
* Multi-layered canvas
* Reasonably realistic physics affecting ball movement (Wind / Gravity / Friction)
* Gamepad support
* Musical songs are ["The Chrysanthemum" by Scott Joplin](https://en.wikipedia.org/wiki/List_of_compositions_by_Scott_Joplin) (used in [BBC Micro](https://en.wikipedia.org/wiki/BBC_Micro) game Repton 2) and ["Black & White Rag" by George Botsford](https://en.wikipedia.org/wiki/Black_and_White_Rag) (used in BBC Micro game [Repton](https://en.wikipedia.org/wiki/Repton_(computer_game)))
* 8-bit tiny font (Repton inspired)
* Simple timelines
* [Wichmann-Hill pseudorandom number generator](https://en.wikipedia.org/wiki/Wichmann%E2%80%93Hill) inspired by [Sploosh Kaboom](https://www.youtube.com/watch?v=1hs451PfFzQ) minigame in [The Legend of Zelda: Wind Waker](https://en.wikipedia.org/wiki/The_Legend_of_Zelda:_The_Wind_Waker) on Nintendo GameCube
* Trophies via [OS13k](https://github.com/KilledByAPixel/OS13k)

# Tools used
* [Ubuntu OS](https://www.ubuntu.com/)
* [vim](https://github.com/vim) text editor (also [gedit](https://github.com/GNOME/gedit) a bit)
* [meld](https://github.com/GNOME/meld) visual diff/merge
* [MeshLab](https://github.com/cnr-isti-vclab/meshlab) 3D model viewer
* [YUI Compressor](https://github.com/yui/yuicompressor) JS/CSS compressor
* [Google closure compiler](https://closure-compiler.appspot.com/home)
* [advzip](https://github.com/amadvance/advancecomp) (uses [7-Zip](https://sourceforge.net/projects/sevenzip/files/7-Zip/) deflate to compress further)

# Stuff I'd have done with more time
- [ ] Play the course in 3D rather than top-down
- [ ] Create a 3D trophy model using "Solids of Revolution"
- [ ] Choose player avatar before starting

_Using some assets from [Kenney.nl "Minigolf Kit"](https://kenney.nl/assets/minigolf-kit) (Creative Commons Zero, CC0 license)._

_Using "The Chrysanthemum" by Scott Joplin (in the public domain since it was published in 1904 - before 1924)._

_Using "Black & White Rag" by George Botsford (in the public domain since it was published in 1908 - before 1924)._
_Using code inspired by following a [tutorial](https://www.youtube.com/watch?v=XgMWc6LumG4) from @Javidx9._

# Duckface

![screenshot](screenshots/season-1-haunted-maze.png)

Duckface is a puzzle platformer featuring butt ugly coder art, dodgy controls, broken physics,
poorly performed music, and humour that isn't probably funny. It's free, open source, and runs in your browser.

Duckface comes with a level editor, and a very crude preview tool for sprite development.

## Where can I play it?

You can play the game at [duckface.lol](https://duckface.lol)

## Credits

The game and it's art is created by Janne Kivilahti. Font used in the game is Gaegu, by JIKJI SOFT. There are no dependencies to other libraries (in game code). That's right, it's bare hands JavaScript all the way.

Following bands have contributed to the game's soundtrack:

- Awful Squares (Teppo Ahonen, Janne Kivilahti)
- FX Ducks (Teppo Ahonen, Janne Kivilahti, Timo Tapola)
- Kyarhem (Janne Kivilahti, Ville Mustavaara, Risto Vierkens, Niko Vihervuori)

## Sources of inspiration

- Poorly Drawn Lines Comic
- Oh, so many NES, MSX and C64 games 
- Monthy Python

## Philosophy

- Punk rock / hacker attitude (DIY)
- Free to play, no strings attached
- Open Source (GPL license)
- 3 button gameplay (left, right, jump)
- All art is programmed, nothing is hand drawn
- Levels should be small and short 
- Test HTML5 canvas 2D capabilities (no WebGL)
- Speedrun friendly (no RNG)

## How to make a production build

You need Node.js to build a production version. Clone the source code, and run:

`npm install`

`npm run build`

To test the production version, run:

`npm start`

After the server has started, open browser from http://localhost:8081

There is also a development server for local developing. You can start the development server by running the command:

`npm run dev`

And open your browser from http://localhost:8080

## TODO

### Game features
- drag 'n drop file load
- recording performance for replay
- water
- credits screen
- version of Cheeks that blows upward
- ice cream -> freeze enemies
- upside down slopes
- duckface push animation 
- localization support
- multiple collision boxes for sprites

### Known Bugs
- skipping title with touch does not work

### Editor features / bugs
- deleting a tile with a sprite collision crashes the editor

### Season 1
- Additional hint to Lord of the Ring

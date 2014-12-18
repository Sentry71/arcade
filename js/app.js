// Create "game" variable, to hold functions called against the overall game state
var Game = function() {
  // Initialize game variables
  this.paused = false;
  this.gameOn = false;
  this.storyIndex = 0;

  /* Create array of text items to be spoken by actors. Set storyIndex
   * to keep track of item being spoken. Text will alternate between actors.
   */
  this.storyText = [
    ['Hi Mike! Are you ready for',
      'tomorrow\'s start to the',
      'nanodegree program?'],
    ['I sure am, Miriam!',
      'I have everything right here...'],
    ['Awesome...'],
    ['Uh oh.'],
    ['What\'s wrong?'],
    ['I can\'t find the course',
      'materials!'],
    ['We definitely need those.'],
    ['I think they might have fallen',
      'out of my pocket on my',
      'way here.'],
    ['Let\'s look around.'],
    ['All the course materials',
      'were found.',
      'Thanks for your help!']
  ];

  //Preload audio sample(s)
  this.bookEfx = new Audio('audio/sfx_book.wav');
  this.collideEfx = new Audio('audio/sfx_collide.wav');
  this.gongEfx = new Audio('audio/sfx_gong.wav');
  this.gongEfxPlayed = false;
};

/* Toggle between paused and un-paused states by blocking updates.
 * This boolean is used in Enemy.update and Player.handleInput
 */
Game.prototype.togglePause = function() {
  this.paused = !this.paused;
};

// Increase number of enemies at end of succesful run
Game.prototype.addAnEnemy = function() {
  /* Determine what row to put the new enemy on. This is determined
   * by finding how many enemies there are, and adding one to the next
   * stone row. When all rows are filled, start again at the first stone row.
   */
  var rows = 4;
  var count = allEnemies.length + 1;

  // Loop to top if count > rows available.
  if (count > rows) {
    count -= rows;
  }

  // Add the new enemy to the allEnemies array
  var enemy = new Enemy(-100, (count * 83) - 21);
  allEnemies.push(enemy);
};

/* Initialize game asset variables. This is called on startup of the game,
 * or if the player presses R on the keyboard.
 */
Game.prototype.gameReset = function() {
  //reset gong sound effect
  this.gongEfxPlayed = false;

  // Place all enemy objects in an array called allEnemies
  allEnemies = [];
  for(i=1; i<4; i++){
    var enemy = new Enemy(0-i*101, 83*i-21);
    allEnemies.push(enemy);
  }

  /* Create array to hold items in scoring position. Prepopulate start and end
   * positions (walls) as nonusable.
   */
  allScorePositions = [];
  var score = new ScorePosition('blank',0);
  allScorePositions.push(score);
  var score2 = new ScorePosition('blank',606);
  allScorePositions.push(score2);

  // Instantiate book offscreen, then randomize its location to start
  book = new Item('book', -100, -100);
  book.reset();

  // Place the player object in a variable called player (in global scope)
  player = new Player(303, 404);

  // Turn on game indicator. This will start game rendering.
  this.gameOn = true;
};

// Switch speaker on intro dialog
Game.prototype.speakerToggle = function() {
  allActors.forEach(function(actor) {
    actor.talking = !actor.talking;
  });
};

/* Initialize intro characters, place in allActors array.
 * Start conversation with actor1.
 */
Game.prototype.initIntro = function() {
  allActors= [];
  var actor1 = new Actor('Miriam', 202, 238);
  actor1.talking = true;
  allActors.push(actor1);
  var actor2 = new Actor('Mike', 404, 238);
  allActors.push(actor2);
};

// For end of game, show additional sprite
Game.prototype.initEnd = function() {
  var actor3 = new Actor('gong', 303, 238);
  allActors.push(actor3);
};


/* Enemies our player must avoid. Rate is randomized on instantiation.
 * @param {number} x    X coordinate of enemy displayed.
 * @param {number} y    Y coordinate of enemy displayed.
 */
var Enemy = function(x, y) {
  this.sprite = 'images/enemy-bug.png';
  this.x = x;
  this.y = y;
  this.rate = 100 + Math.floor(Math.random() * 150);
};

/* Update the enemy's position, required method for game
 * @param {number} dt A time delta between ticks.
 */
Enemy.prototype.update = function(dt) {
  if (!game.paused){
    this.x = this.x + (dt * this.rate);
  }

  // When bug goes off one side, reappear on the other side
  if (this.x > 700){
    this.x = -100;
  }
};

// Randomize start location of enemy
Enemy.prototype.reset = function() {
  this.x = 0 - Math.random() * 200;
};

// Increase speed of enemies slightly
Enemy.prototype.increaseRate = function() {
  this.rate += 50;
};

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* Player class, to represent our player.
 * @param {number} x    X coordinate of player location.
 * @param {number} y    Y coordinate of player location.
 */
var Player = function(x,y) {
  this.sprite = 'images/Miriam.png';
  this.x = x;
  this.y = y;
  this.carryItem = false;
};

// Reset player's position to start location
Player.prototype.reset = function() {
  /* Switch between player sprites if scoring row not reached
   * or scoring row is reached without carrying the item.
   * Switching is based on a search against the sprite name.
   * A ternary operator is used to alternate between images.
   */
  if (this.y > 0 || (this.y < 0 && !this.carryItem)) {
    var name = (this.sprite.search('Mike') !== -1) ? 'Miriam' : 'Mike';
    this.sprite = 'images/' + name + '.png';
  }

  /* If player is carrying an item, set carryItem to false and
   * modify sprite name to no longer display that item
   */
  if (this.carryItem) {
    this.carryItem = false;
    this.sprite = this.sprite.replace('_w_' + book.name,'');
  }

  // Set player to start position
  this.x = 303;
  this.y = 404;
};

/* Handle keyboard input during gameplay.
 * 'IF' statements verify movement will not allow the player outside the
 * canvas boundaries before the movement is calculated.
 * @param {String} key, the keyCode from the key pressed
 */
Player.prototype.handleInput = function(key) {
  switch(key) {
    case 'up':
      if (this.y > 0 && !game.paused){
        this.y -= 83;
      }
      break;
    case 'down':
      if (this.y < 404 && !game.paused) {
        this.y += 83;
      }
      break;
    case 'left':
      if (this.x > 0 && !game.paused) {
        this.x -= 101;
      }
      break;
    case 'right':
      if (this.x < 606 && !game.paused){
        this.x += 101;
      }
      break;
    case 'pause':
      game.togglePause();
      break;
    case 'restart':
      game.gameReset();
      break;
  }
};

//Draw player on the screen
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* Create item class for item(s) to be picked up by player.
 * @param {String} name Name of item, corresponds to image in memory.
 * @param {number} x    X coordinate of item displayed.
 * @param {number} y    Y coordinate of item displayed.
 */
var Item = function (name, x, y) {
  this.name = name;
  this.sprite = 'images/' + name + '.png';
  this.x = x;
  this.y = y;
  this.visible = true;
};

// Steps to be carried out when an item is picked up by the player
Item.prototype.pickup = function() {
  // Set parameters for objects
  this.visible = false;
  player.carryItem = true;

  // Change player sprite name to show item carried (Mike.png becomes Mike_w_book.png)
  player.sprite = player.sprite.slice(0,-4) + '_w_' + this.name + '.png';

  // Hide item off screen (to be reused on reset)
  this.x = -101;
  this.y = -101;
};

// Drop item on game board, update entities to match state.
Item.prototype.drop = function() {
  this.visible = true;
  player.carryItem = false;
  this.x = player.x;
  this.y = player.y;
};

// Reset will set item on game board to be picked up.
Item.prototype.reset = function() {
  this.x = Math.floor(Math.random() * 5) * 101;
  this.y = Math.ceil(Math.random() * 4) * 83 - 11;
  this.visible = true;
};

// Hide item when no longer needed (end game, etc.)
Item.prototype.hide = function() {
  this.visible = false;
  player.carryItem = false;
};

// Draw the item on the game board
Item.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};

/* Create item(s) to hold information about where an item has been placed
 * on the scoring row.
 * @param {String} name Name of item, corresponds to image in memory.
 * @param {number} x    X coordinate of item displayed.
 */
var ScorePosition = function(name, x) {
  this.x = x;
  this.y = -11;
  this.sprite = 'images/' + name + '.png';
};

//Draw items on scoring row
ScorePosition.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};


/* Create actors for intro/gameOver dialogs
 * @param {String} name Name of actor, corresponds to image in memory.
 * @param {number} x    X coordinate of actor displayed.
 * @param {number} y    Y coordinate of actor displayed.
 */
var Actor = function(name, x, y) {
  this.sprite = 'images/' + name + '.png';
  this.x = x;
  this.y = y;
  this.talking = false;
};

/* Draw actor on game board. If this specific actor is talking, add the
 * indicator above their head, connecting to the chat bubble.
 */
Actor.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  if(this.talking) {
    ctx.drawImage(Resources.get('images/bubble-tip.png'),
      this.x + 29, this.y + 38);
  }
};

/* Handle keyboard input during intro scene. When all text for intro
 * is complete, show gameplay instructions below game board and start game.
 * @param {String} key Value of keypress, as determined in the event listener.
 */
Actor.prototype.handleInput = function(key) {
  switch(key) {
    case 'spacebar':
      if (game.storyIndex < 8){
        game.storyIndex++;
        game.speakerToggle();
      } else {
        game.storyIndex = 9;
        document.getElementById('instructions').className = '';
        game.gameReset();
      }
      break;
  }
};

//Initialize game (implicity global)
game = new Game();

/* This listens for key presses and sends the keys to your handleInput() methods.
 * Also prevents standard responses to key presses.
 */
document.addEventListener('keydown', function(e) {
  if (!game.gameOn) {
    var allowedKeys = {
      32: 'spacebar'
    }
    allActors[0].handleInput(allowedKeys[e.keyCode]);
  } else {
    var allowedKeys = {
      32: 'spacebar',
      37: 'left',
      38: 'up',
      39: 'right',
      40: 'down',
      65: 'left',      // A
      68: 'right',     // D
      83: 'down',      // S
      80: 'pause',
      82: 'restart',
      87: 'up'         // W
    };
    player.handleInput(allowedKeys[e.keyCode]);
  }
  if (e.keyCode in allowedKeys){
    e.preventDefault();
  }
});

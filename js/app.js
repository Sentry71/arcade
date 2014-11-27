// Create "global" variables
var paused = false;
var gameOn = false;

// Toggle between paused and un-paused states by blocking updates.
// This boolean is used in Enemy.update and Player.handleInput
function togglePause() {
  paused = !paused;
}

// Enemies our player must avoid
var Enemy = function(x, y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.rate = 100 + Math.floor(Math.random() * 150);
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    if (!paused){
      this.x = this.x + (dt * this.rate);
    }

    // When bug goes off one side, reappear on the other side
    if (this.x > 700){
      this.x = -100;
    }
}

// Randomize start location of enemies when level completed
Enemy.prototype.reset = function() {
  this.x = 0 - Math.random() * 200;
}

// Increase speed of enemies slightly
Enemy.prototype.increaseRate = function() {
  this.rate += 50;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

/* Increase number of enemies at end of succesful run.
 * Note: this is not part of the Enemy class, as it does not run for every
 * enemy - it is a generic game function.
 */
addAnEnemy = function() {
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

  // Add the enemy to the allEnemies array
  var enemy = new Enemy(-150, (count * 83) - 21);
  allEnemies.push(enemy);
}


// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x,y) {
  this.sprite = 'images/Miriam.png';
  this.x = x;
  this.y = y;
  this.carryItem = false;
}

Player.prototype.update = function() {
  // Unused at this time.
}

// Reset player's position to start location
Player.prototype.reset = function() {
  /* Switch between player sprites if scoring row not reached
   * or scoring row is reached without carrying the item.
   * Switching is based on a serach against the sprite name.
   * A ternary operator is used to alternate between images.
   */
  if (this.y > 0 || (this.y < 0 && this.carryItem == false)) {
    this.sprite = (this.sprite.search('Mike') !== -1) ? 'images/Miriam.png' : 'images/Mike.png';
  }

  // If player is carrying an item, set carryItem to false and
  // modify sprite name to no longer display that item
  if (this.carryItem === true) {
    this.carryItem = false;
    this.sprite = this.sprite.replace('_w_' + book.name,'');
  }

  // Set player to start position
  this.x = 303;
  this.y = 404;
}

// Takes input and does something with it
// Parameter: key, the keyCode from the key pressed
// IF statements verify movement will not allow the
// player outside the canvas boundaries before the
// movement is rendered.

Player.prototype.handleInput = function(key) {
  switch(key) {
    case 'up':
      if (this.y > 0 && !paused){
        this.y -= 83;
      }
      break;
    case 'down':
      if (this.y < 404 && !paused) {
        this.y += 83;
      }
      break;
    case 'left':
      if (this.x > 0 && !paused) {
        this.x -= 101;
      }
      break;
    case 'right':
      if (this.x < 606 && !paused){
        this.x += 101;
      }
      break;
    case 'pause':
      togglePause();
      break;
    case 'restart':
      gameReset();
      break;
  }

  //Log location to console for debugging
  //console.log("Location: x " + this.x + " : y " + this.y);
}

//Draw player on the screen
Player.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}


//Create item class for item(s) to be picked up by player
var Item = function (name, x, y) {
  this.name = name;
  this.sprite = 'images/' + name + '.png';
  this.x = x;
  this.y = y;
  this.visible = true;
}

// Steps to be carried out when an item is picked up by the player
Item.prototype.pickup = function() {
  // Set parameters for objects
  this.visible = false;
  player.carryItem = true;

  // Change player sprite name to show item carried
  // For example, Mike.png becomes Mike_w_book.png
  player.sprite = player.sprite.slice(0,-4) + '_w_' + this.name + '.png';

  // Hide item off screen (to be reused on reset)
  this.x = -101;
  this.y = -101;
}

Item.prototype.drop = function() {
  this.visible = true;
  player.carryItem = false;
  this.x = player.x;
  this.y = player.y;
}

// Reset will set item on game board to be picked up
Item.prototype.reset = function() {
  // Randomize the location of the item.
  this.x = Math.floor(Math.random() * 5) * 101;
  this.y = (Math.floor(Math.random() * 4) + 1) * 83 - 11;
  this.visible = true;
}

// Hide item when no longer needed (end game, etc.)
Item.prototype.hide = function() {
  this.visible = false;
  player.carryItem = false;
}

// Draw the item on the game board
Item.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Create item(s) to hold information about where an item has been placed on the
// scoring row.
var ScorePosition = function(name, x) {
  this.x = x;
  this.y = -11;
  this.sprite = 'images/' + name + '.png';
}

//Draw items on scoring row
ScorePosition.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Initialize game asset variables. This is called on startup of the game,
// or if the player presses R on the keyboard.
function gameReset() {
  // Turn on game indicator (this should start the game).
  gameOn = true;

  // Now instantiate your objects.
  // Place all enemy objects in an array called allEnemies
  allEnemies = [];
  for(i=1; i<4; i++){
    var enemy = new Enemy(0-i*101, 83*i-21);
    allEnemies.push(enemy);
  }

  // Create array to hold items in scoring position. Prepopulate start and end
  // positions (walls) as nonusable.
  allScorePositions = [];
  var score = new ScorePosition('blank',0);
  allScorePositions.push(score);
  var score2 = new ScorePosition('blank',606);
  allScorePositions.push(score2);

  // Instantiate book offscreen, then randomize its location to start
  book = new Item('book', -100, -100);
  book.reset();

  // Place the player object in a variable called player
  player = new Player(303, 404);
}


// Create actors for intro/gameOver dialogs
var Actor = function(name, x, y) {
  this.sprite = 'images/' + name + '.png';
  this.x = x;
  this.y = y;
  this.talking = false;
}

// Draw actor on game board. If this specific actor is talking, add the
// indicator above their head, connecting to the chat bubble.
Actor.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
  if(this.talking) {
    ctx.drawImage(Resources.get('images/bubble-tip.png'), this.x + 29, this.y + 38);
  }
}

// Handle keyboard input during intro scene
Actor.prototype.handleInput = function(key) {
  switch(key) {
    case 'spacebar':
      if (storyIndex < 8){
        storyIndex++;
        speakerToggle();
      } else {
        storyIndex = 9;
        gameReset();
      }
      break;
  }
}

// Switch speaker on intro dialog
function speakerToggle() {
  allActors.forEach(function(actor) {
    actor.talking = !actor.talking;
  });
}

// Initialize intro characters, place in allActors array.
// Start conversation with actor1.
function initIntro() {
  allActors= [];
  var actor1 = new Actor('Miriam', 202, 238);
  actor1.talking = true;
  allActors.push(actor1);
  var actor2 = new Actor('Mike', 404, 238);
  allActors.push(actor2);
}

// Create array of text items to be spoken by actors. Set storyIndex
// to keep track of item being spoken. Text will alternate between actors.
var storyText = [
  ['Hey Mike, ready for', 'tomorrow\'s start to the', 'nanodegree program?'],
  ['I sure am, Miriam!', 'I have everything right here...'],
  ['Awesome...'],
  ['Uh oh.'],
  ['What\'s wrong?'],
  ['I can\'t find the course', 'materials!'],
  ['We definitely need those.'],
  ['I think they might have fallen', 'out of my pocket on my', 'way here.'],
  ['Let\'s look around.'],
  ['All the course materials','were found.','Thanks for your help!']
];
var storyIndex = 0;


// This listens for key presses and sends the keys to your
// handleInput() methods.
document.addEventListener('keyup', function(e) {
  if (!gameOn) {
    var allowedKeys = {
      32: 'spacebar'
    }
    allActors[0].handleInput(allowedKeys[e.keyCode]);
  } else {
    var allowedKeys = {
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
  //Write keyCode and "definition" to console for debugging
  //console.log(e.keyCode, allowedKeys[e.keyCode]);
});

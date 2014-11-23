// Enemies our player must avoid
var Enemy = function(x, y) {
    // Variables applied to each of our instances go here,
    // we've provided one for you to get started

    // The image/sprite for our enemies, this uses
    // a helper we've provided to easily load images
    this.sprite = 'images/enemy-bug.png';
    this.x = x;
    this.y = y;
    this.rate = 100 + Math.floor(Math.random() * 200);
}

// Update the enemy's position, required method for game
// Parameter: dt, a time delta between ticks
Enemy.prototype.update = function(dt) {
    // You should multiply any movement by the dt parameter
    // which will ensure the game runs at the same speed for
    // all computers.
    this.x = this.x + (dt * this.rate);

    // When bug goes off the one side, reappear on the other side
    if (this.x > 500){
      this.x = -100;
    }
}

// Reset enemy bugs when level completed
Enemy.prototype.reset = function() {
  this.x = 0 - Math.random() * 200;
}

// Draw the enemy on the screen, required method for game
Enemy.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now write your own player class
// This class requires an update(), render() and
// a handleInput() method.
var Player = function(x,y) {
  this.sprite = 'images/Mike.png';
  this.x = x;
  this.y = y;
  this.carryItem = false;
}

// Update player
Player.prototype.update = function() {


}

// Reset player's position to start location
Player.prototype.reset = function() {
  // Switch between player sprites if goal not reached
  if (this.y > 0) {
    this.sprite = (this.sprite.search('Mike') !== -1) ? 'images/Miriam.png' : 'images/Mike.png';
  }
  // If player is carrying an item, modify sprite name to
  // no longer display that item
  if (this.carryItem == true) {
    this.carryItem = false;
    var name = book.name;
    this.sprite = this.sprite.replace('_w_' + name,'');
  }
  // Set to start position
  this.x = 202;
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
      if (this.y > 0){
        this.y -= 83;
      }
      break;
    case 'down':
      if (this.y < 404) {
        this.y += 83;
      }
      break;
    case 'left':
      if (this.x > 0) {
        this.x -= 101;
      }
      break;
    case 'right':
      if (this.x < 404){
        this.x += 101;
      }
      break;
  }

  //Log location to console for debugging
  console.log("Location: x " + this.x + " : y " + this.y);
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

Item.prototype.pickup = function() {
  this.visible = false;
  player.carryItem = true;
  // Change player sprite name to show item carried
  // For example, Mike.png becomes Mike_w_book.png
  player.sprite = (player.sprite).slice(0,-4) + '_w_' + this.name + '.png';

  // Hide item off screen (to be reused on reset)
  this.x = -101;
  this.y = -101;
}

Item.prototype.reset = function() {
  this.visible = true;
  this.x = Math.floor(Math.random() * 5) * 101;
  this.y = (Math.floor(Math.random() * 4) + 1) * 83 - 11;
  //console.log(this.x, this.y);
}

Item.prototype.render = function() {
  ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
}

// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
allEnemies = [];
for(i=1; i<4; i++){
  var enemy = new Enemy(0-i*101, 83*i-21);
  allEnemies.push(enemy);
}

// Place book to be picked up by player
var book = new Item('book', 202, 238);

// Place the player object in a variable called player
var player = new Player(202, 404);


// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
document.addEventListener('keyup', function(e) {
    var allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down'
    };

    //Write keyCode and "definition" to console for debugging
    //console.log(e.keyCode, allowedKeys[e.keyCode]);

    player.handleInput(allowedKeys[e.keyCode]);
});

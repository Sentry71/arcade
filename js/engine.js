/* Engine.js
 * This file provides the game loop functionality (update entities and render),
 * draws the initial game board on the screen, and then calls the update and
 * render methods on your player and enemy objects (defined in your app.js).
 *
 * A game engine works by drawing the entire game screen over and over, kind of
 * like a flipbook you may have created as a kid. When your player moves across
 * the screen, it may look like just that image/character is moving or being
 * drawn but that is not the case. What's really happening is the entire "scene"
 * is being drawn over and over, presenting the illusion of animation.
 *
 * This engine is available globally via the Engine variable and it also makes
 * the canvas' context (ctx) object globally available to make writing app.js
 * a little simpler to work with.
 */

var Engine = (function(global) {
    /* Predefine the variables we'll be using within this scope,
     * create the canvas element, grab the 2D context for that canvas
     * set the canvas elements height/width and add it to the DOM.
     */
    var doc = global.document,
        win = global.window,
        canvas = doc.createElement('canvas'),
        ctx = canvas.getContext('2d'),
        lastTime;

    canvas.width = 707;
    canvas.height = 606;
    document.getElementById('game-board').appendChild(canvas);

    /* This function serves as the kickoff point for the game loop itself
     * and handles properly calling the update and render methods.
     */
    function main() {
      /* Get our time delta information which is required if your game
       * requires smooth animation. Because everyone's computer processes
       * instructions at different speeds we need a constant value that
       * would be the same for everyone (regardless of how fast their
       * computer is) - hurray time!
       */
      var now = Date.now(),
          dt = (now - lastTime) / 1000.0;


      /* Call our update/render functions, pass along the time delta to
       * our update function since it may be used for smooth animation.
       */
      update(dt);
      render();

      /* Set our lastTime variable which is used to determine the time delta
       * for the next time this function is called.
       */
      lastTime = now;

      /* Use the browser's requestAnimationFrame function to call this
       * function again as soon as the browser is able to draw another frame.
       */
      win.requestAnimationFrame(main);
    };

    /* This function does some initial setup that should only occur once,
     * particularly setting the lastTime variable that is required for the
     * game loop.
     */
    function init() {
      initIntro();
      lastTime = Date.now();
      main();
    }

    /* This function is called by main (our game loop) and itself calls all
     * of the functions which may need to update entity's data. Based on how
     * you implement your collision detection (when two entities occupy the
     * same space, for instance when your character should die), you may find
     * the need to add an additional function call here. For now, we've left
     * it commented out - you may or may not want to implement this
     * functionality this way (you could just implement collision detection
     * on the entities themselves within your app.js file).
     */
    function update(dt) {
      if (gameOn) {
        updateEntities(dt);
        checkCollisions();
        updateScoringRow();
      }
    }

    /* This is called by the update function  and loops through all of the
     * objects within your allEnemies array as defined in app.js and calls
     * their update() methods. It will then call the update function for your
     * player object. These update methods should focus purely on updating
     * the data/properties related to  the object. Do your drawing in your
     * render methods.
     */
    function updateEntities(dt) {
      allEnemies.forEach(function(enemy) {
        enemy.update(dt);
      });
    }

    // Check collisions
    function checkCollisions(){
      /* Check for enemy collision.
       * Allow for 10 pixel difference in alignment of enemy and player
       * Y positions on the same row, due to centering of sprites.
       * Collision occurs when opposite side X coords are within 75 pixels.
       */
      allEnemies.forEach(function(enemy) {
        if(player.y - enemy.y == 10) {
          if(player.x < enemy.x + 75 && player.x + 75 > enemy.x ){
            // If the player is carrying an item, drop it.
            if (player.carryItem) {
              book.drop();
            }
            player.reset();
          }
        }
      });

      //Check for collision between player and the book, and take book.
      if(player.y === book.y && player.x === book.x) {
        book.pickup();
      }
    }


    function updateScoringRow() {
      // Check if player has reached the scoring row.
      if(player.y < 0) {
        // Verify player is at with an open position. Set openSlot boolean
        // to indicate if there is an open spot above the player.
        var openSlot = true;
        allScorePositions.forEach(function(pos) {
          if(player.x === pos.x){
            openSlot = false;
          }
        });
        // If position is open, add book.
        if(openSlot && player.carryItem) {
          var score = new ScorePosition('book',player.x);
          allScorePositions.push(score);
          // If all positions filled, end game.
          if (allScorePositions.length == 7){
            gameOver();
          } else {
            // Add another bug to the array.
            addAnEnemy();
            // Reset entities for next round.
            player.reset();
            book.reset();
            allEnemies.forEach(function(enemy) {
              enemy.increaseRate();
              //enemy.reset();
            });
          }
        }else{
          // If the position is not open, put player back where they were.
          player.y += 83;
        }
      }
    }

    // When game ends, clear the allEnemies array, hide the book,
    // and disable the gameOn indicator.
    function gameOver() {
      allEnemies = [];
      book.hide();
      gameOn = false;
    }

    /* This function initially draws the "game level", it will then call
     * the renderEntities function. Remember, this function is called every
     * game tick (or loop of the game engine) because that's how games work -
     * they are flipbooks creating the illusion of animation but in reality
     * they are just drawing the entire screen over and over.
     */
    function render() {
      // Call function to render the top row.
      var topRowTiles = [
        'images/tall-wall.png',
        'images/wood-block.png',
        'images/wood-block.png',
        'images/wood-block.png',
        'images/wood-block.png',
        'images/wood-block.png',
        'images/tall-wall.png'
      ];

      /* This array holds the relative URL to the image used
       * for that particular row of the game level.
       */
      var rowImages = [
          'images/wood-block.png',    // Top row is wood (no longer used)
          'images/stone-block.png',   // Row 1 of 3 of stone
          'images/stone-block.png',   // Row 2 of 3 of stone
          'images/stone-block.png',   // Row 3 of 3 of stone
          'images/stone-block.png',   // Row 1 of 2 of grass
          'images/grass-block.png'    // Row 2 of 2 of grass
        ],
        numRows = 6,
        numCols = 7,
        row, col;

      // Loop through the number of columns to draw the specific top row tiles
      for (col = 0; col < numCols; col++) {
        ctx.drawImage(Resources.get(topRowTiles[col]), col * 101, 0);
      }

      // Call images specifically for top row decoration AFTER the top row
      // is rendered, so they draw on top of the base tiles.
      ctx.drawImage(Resources.get('images/roof-se.png'), 0, -81);
      ctx.drawImage(Resources.get('images/roof-sw.png'), 606, -81);

      /* Loop through the number of rows and columns we've defined above
       * and, using the rowImages array, draw the correct image for that
       * portion of the "grid"
       */
      for (row = 1; row < numRows; row++) {
        for (col = 0; col < numCols; col++) {
          /* The drawImage function of the canvas' context element
           * requires 3 parameters: the image to draw, the x coordinate
           * to start drawing and the y coordinate to start drawing.
           * We're using our Resources helpers to refer to our images
           * so that we get the benefits of caching these images, since
           * we're using them over and over.
           */
          ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
        }
      }

      //If showing intro, render intro entities. Otherwise, render game entities.
      if (!gameOn) {
        renderIntro();
      } else {
        renderEntities();
      }
    }


    /* This function is called to draw the intro/gameOver scene. It uses the
     * Actor constructor to create items, as they are not player controlled.
     */
    function renderIntro() {
      if(typeof allScorePositions !== 'undefined') {
        renderScoringRow();
      }
      bubbleRect(205,177,300,100,25,10,'#fff','#000');
      allActors.forEach(function(actor) {
        actor.render();
      });
      renderStory();
    }

    /* This function takes the information from the storyText array in app.js,
     * and uses that data to render the text in the story bubble above the
     * actors. A helper text is also rendered at the bottom of the play area,
     * to indicate Spacebar functionality.
     */
    function renderStory () {
      ctx.font = '16pt Arial';  // TODO: change font
      ctx.fillStyle = '#000';
      for (var i=0; i < storyText[storyIndex].length; i++){
        ctx.fillText(storyText[storyIndex][i],225,207 + i * 25);
      }
      ctx.strokeStyle = '#fff';
      var helpText = '';
      if (storyIndex < 9){
        helpText = 'Press Spacebar to continue';
      } else {
        helpText = 'Press Spacebar to play again';
        allActors[1].talking = true;
      }
      ctx.lineWidth = 5;
      ctx.strokeText(helpText,225,515);
      ctx.fillText(helpText,225,515);
    }

    /** Code below from http://js-bits.blogspot.com/2010/07/canvas-rounded-corner-rectangles.html
    * Draws a rounded rectangle using the current state of the canvas.
    * @param {Number} x The top left x coordinate.
    * @param {Number} y The top left y coordinate.
    * @param {Number} width The width of the rectangle.
    * @param {Number} height The height of the rectangle.
    * @param {Number} radius The corner radius.
    * @param {Number} lineWidth The width of the stroke.
    * @param {String} fill What color to use on the fill.
    * @param {String} stroke What color to use on the stroke.
    */
    function bubbleRect(x, y, width, height, radius, lineWidth, fill, stroke) {
      ctx.lineWidth = lineWidth;
      ctx.fillStyle = fill;
      ctx.strokeStyle = stroke;
      ctx.beginPath();
      ctx.moveTo(x + radius, y);
      ctx.lineTo(x + width - radius, y);
      ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
      ctx.lineTo(x + width, y + height - radius);
      ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
      ctx.lineTo(x + radius, y + height);
      ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
      ctx.lineTo(x, y + radius);
      ctx.quadraticCurveTo(x, y, x + radius, y);
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }

    /* This function is called by the render function and is called on each game
     * tick. It's purpose is to then call the render functions you have defined
     * on your enemy and player entities within app.js
     */
    function renderEntities() {
      // Render books on top row from successful placements by player
      renderScoringRow();

      // Render item only if not picked up (book.visible = true)
      if(book.visible) {
        book.render();
      }

      /* Loop through all of the objects within the allEnemies array and call
       * the render function you have defined.
       */
      allEnemies.forEach(function(enemy) {
        enemy.render();
      });

      player.render();
    }

    // Since this render is used in the game and in the gameOver screen,
    // it was refactored out on its own.
    function renderScoringRow () {
      allScorePositions.forEach(function(pos) {
        pos.render();
      });
    }

    /* Go ahead and load all of the images we know we're going to need to
     * draw our game level. Then set init as the callback method, so that when
     * all of these images are properly loaded our game will start.
     */
    Resources.load([
      'images/stone-block.png',
      'images/wood-block.png',
      'images/grass-block.png',
      'images/enemy-bug.png',
      'images/Mike.png',
      'images/Mike_w_book.png',
      'images/Miriam.png',
      'images/Miriam_w_book.png',
      'images/book.png',
      'images/tall-wall.png',
      'images/roof-se.png',
      'images/roof-sw.png',
      'images/blank.png',
      'images/cloud.png',
      'images/bubble-tip.png'
    ]);
    Resources.onReady(init);

    /* Assign the canvas' context object to the global variable (the window
     * object when run in a browser) so that developer's can use it more easily
     * from within their app.js files.
     */
    global.ctx = ctx;
})(this);

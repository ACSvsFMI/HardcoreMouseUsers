// Keep track of how many messages were sent
var messageLastSeen = {};
var myMessageCount = 0;
var missedMessages = 0;

// Various constants for width and height
var tileSide = 100;
var pixelWidth = 300;
var pixelHeight = 300;
var tileWidth = pixelWidth / tileSide;
var tileHeight = pixelHeight / tileSide;

// Holds all our tile colors
var state_ = null;
// Grid is 9 by 9

var currentPlayer = '0';
var width;
var height;
var grid = [];
var ERR = -1;

function initGrid(h, w) {
  grid = [];
  height = h;
  width = w;
  for (var i = 0; i < width; i++) {
    var row = [];
    for (var j = 0; j < height; j++) {
      row.push('-');
    }
    grid.push(row);
  }
}

function printGrid() {
  document.write("<br>");
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      document.write(grid[i][j] + ' ');
    }
    console.log(grid[i]);
    document.write("<br>");
  }
  document.write("<br>");
}

function putPiece(col, player) {
  if (col < 0 || col >= width) {
    console.log("Column not valid.");
    return ERR;
  }
  var clearRow = height;
  for (var row = 0; row < height; ++row) {
    if (isClear(row, col)) {
      clearRow = row;
    }
  }
  if (clearRow == height) {
    console.log("Column is full.");
    return ERR;
  }
  addMove(clearRow, col, player);
  return 1;
}

function addMove(row, col, player) {
  /*  We are sure here that row and col are free
   *  player is a char: either '1' or '2'
   */
  grid[row][col] = player;
}

function isClear(row, col) {
  if (grid[row][col] == '-') {
    return true;
  }
  return false;
}


function changeCurrentPlayer() {
  if (currentPlayer == '1') {
    currentPlayer = '2';
    return 1;
  } else if (currentPlayer == '2') {
    currentPlayer = '1';
    return 1;
  }
  console.log("Trying to change player that is not initialized.");
  return ERR;
}

function randomNumber(min, max) {
  /* Parameters should be integers*/
  var randomNumber = Math.floor(Math.random() * Math.floor(max - min + 1));
  randomNumber += min;
  return randomNumber;
}

function fullGrid() {
  for (var i = 0; i < grid.length; i++) {
    for (var j = 0; j < grid[i].length; j++) {
      if (grid[i][j] == '-') {
        return false;
      }
    }
  }
  return true;
}

function draw() {
  //console.log("drawing");
  var canvas = document.getElementById('canvas');
  if (canvas.getContext) {
    var ctx = canvas.getContext('2d');
    canvas_height = canvas.height;
    canvas_width = canvas.width;

    for (var i = 0; i < width; i++) {
      for (var j = 0; j < height; j++) {
        ctx.beginPath();
        // arc(x, y, radius, startAngle, endAngle, anticlockwise)
        var x = (canvas_width / width) * (i + 0.5);
        var y = (canvas_height / height) * (j + 0.5);
        var radius = (canvas_height / height) * 0.4;
        ctx.arc(y, x, radius, 0, Math.PI * 2, true);
        ctx.strokeStyle = 'black';
        ctx.stroke();
        
        if (grid[i][j] === '1') {
          ctx.fillStyle = 'green';
          ctx.fill();
        } else if (grid[i][j] === '2') {
          ctx.fillStyle = 'red';
          ctx.fill();
        }
      }
    }
  }
}

/** Move mouse
 * @param {number} x x coordinate.
 * @param {number} y y coordinate.
 */
function mouseClick(x, y) {
    console.log("clicked at column = ");

    // if (state_["lastPlayer"] == thisPlayer)
    //   return;
    var colWidth = canvas_width / width;
    var column = Math.floor(y / colWidth);
    
    console.log("clicked at column = " + column);

    putPiece(column, currentPlayer);
    draw();
    randomBotPlay();
}

function randomBotPlay() {
  for (var i = 0; i < 10; ++i) {
    var col = randomNumber(0, width - 1);
    while (putPiece(col, currentPlayer) == ERR) {
      col = randomNumber(0, width);
    }
    console.log("Adding " + currentPlayer + " to " + col);
   // changeCurrentPlayer();
  }
  draw();
}

/** Kick off the app. */
function initGame() {
  // When API is ready...
  gapi.hangout.onApiReady.add(
      function(eventObj) {
        if (eventObj.isApiReady) {
          try {
            // thisPlayer = gapi.hangout.getLocalParticipant().displayIndex.toString();
            // gapi.hangout.data.onStateChanged.add(onStateChanged);
            // gapi.hangout.data.setValue("lastPlayer", "1");
            
            initGrid(9, 9);
            currentPlayer = '1';

            document.getElementById('canvas').onclick = function(e) {
              var ev = e || window.event;
              mouseClick(ev.clientX - canvas.offsetLeft,
                        ev.clientY - canvas.offsetTop);
            };
            draw();
          } catch (e) {
            console.log('init:ERROR');
            console.log(e);
          }
        }
      });
}

gadgets.util.registerOnLoadHandler(initGame);


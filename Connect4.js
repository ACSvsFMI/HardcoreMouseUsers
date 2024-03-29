// Holds all our tile colors
var state_ = null;
// Grid is 9 by 9
var grid = [];

var thisPlayer;
var lastPlayer;
var currentPlayer; // used mainly for playing against AI
var width;
var height;
var ERR = -1;
var canvas = document.getElementById('canvas');
var againstAI;
var hasStarted = false;

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
  gapi.hangout.data.setValue(JSON.stringify([row, col]), player);
}

function isClear(row, col) {
  if (grid[row][col] == '-') {
    return true;
  }
  return false;
}

function getOpponent(player) {
  if (player == '1') {
    return '2';
  } else if (player == '2') {
    return '1';
  }
  console.log("Trying to get opponent of a player that is not initialized.");
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

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas_width, canvas_height);

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
  console.log(grid);
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

function mouseClick(x, y) {
  state_ = gapi.hangout.data.getState();
  if (state_["lastPlayer"] == thisPlayer)
    return;
  var colWidth = canvas_width / width;
  var column = Math.floor(x / colWidth);
  
  console.log("clicked at column = " + column);

  putPiece(column, thisPlayer);
  draw();

  console.log("this player is " + thisPlayer);
  //state_["lastPlayer"] = thisPlayer;
  gapi.hangout.data.setValue("lastPlayer", thisPlayer);

  if (againstAI) {
    changeCurrentPlayer();
    randomBotPlay();
  }
}

function randomBotPlay() {
  var col = randomNumber(0, width - 1);
  while (putPiece(col, currentPlayer) == ERR) {
    col = randomNumber(0, width - 1);
  }
  console.log("Adding " + currentPlayer + " to " + col);
  gapi.hangout.data.setValue("lastPlayer", currentPlayer);
  changeCurrentPlayer();
  draw();
}

function setAgainstAI() {
  againstAI = true;
  gapi.hangout.data.setValue("againstAI", againstAI.toString());
  start();
}

function setAgainstHuman() {
  console.log("setting against human");
  againstAI = false;
  gapi.hangout.data.setValue("againstAI", againstAI.toString());
  start();
}

function setAgainstFromState() {
  if (gapi.hangout.data.getValue("againstAI")) {
    if (gapi.hangout.data.getValue("againstAI") == "true") {
      againstAI = true;
    } else {
      againstAI = false;
    }
  }
}

function start() {
  state_ = gapi.hangout.data.getState();
  setAgainstFromState();
  if ((!againstAI) && (gapi.hangout.getEnabledParticipants() != 2)) {
    console.log("not enough participants, against human");
    return;
  }
  initGrid(9, 9);
  lastPlayer = '2'; // to ensure the first player is always 0
  gapi.hangout.data.setValue("lastPlayer", "2");
  gapi.hangout.data.setValue("againstAI", againstAI.toString());
  document.getElementById("options").style.display="none";
  document.getElementById("game").style.display="block";
  draw();
  hasStarted = true;
  console.log("the grid has been drawn");
  console.log(grid);
}

function updateGrid() {
  for (var coords in state_) {
    if (coords == "lastPlayer" || coords == "againstAI") {
      continue;
    }
    var coordsXY = JSON.parse(coords);
    grid[coordsXY[0]][coordsXY[1]] = state_[coords];
  }
}

/** The state has changed.
 * @param {StateChangedEvent} event An event.
 */
function onStateChanged(event) {
  try {
    state_ = event.state;
    console.log("in onStateChanged:  " + state_)
    updateGrid();
    draw();
  } catch (e) {
    console.log(e);
  }
}

function resetGrid() {
  var delta = {};
  initGrid(9, 9);
  delta["lastPlayer"] = "2";
  var keys = gapi.hangout.data.getKeys();
  var remove_keys = [];
  for(var i = 0; i < keys.length; i++) {
    if(keys[i] != "lastPlayer") {
      remove_keys.push(keys[i].toString());
    }
  }
  gapi.hangout.data.submitDelta(delta, remove_keys);
}

/** Kick off the app. */
function initGame() {
  // When API is ready...
  gapi.hangout.onApiReady.add(
    function(eventObj) {
      if (eventObj.isApiReady) {
        try {
          thisPlayer = (gapi.hangout.getLocalParticipant().displayIndex + 1).toString();
          currentPlayer = thisPlayer;
          console.log("init, this player is " + thisPlayer);
          
          // in case participants change, update this participant's id
          gapi.hangout.onEnabledParticipantsChanged.add(function(participantsEvent) {
            thisPlayer = (gapi.hangout.getLocalParticipant().displayIndex + 1).toString();
            currentPlayer = thisPlayer;
          });

          gapi.hangout.data.onStateChanged.add(onStateChanged);

          initGrid(9, 9);
          document.getElementById('canvas').onclick = function(e) {
            if (hasStarted) {
              var ev = e || window.event;
              mouseClick(ev.clientX - canvas.offsetLeft,
                         ev.clientY - canvas.offsetTop);
            }
          };
        } catch (e) {
          console.log('init:ERROR');
          console.log(e);
        }
      }
    });
}

function waiting() {
  console.log("players " + gapi.hangout.getEnabledParticipants());
  initGame();
  gapi.hangout.onEnabledParticipantsChanged.add(checkParticipants);
}

function checkParticipants(participantsEvent) {
  console.log("num players " + participantsEvent.enabledParticipants.length);
  if (againstAI) {
    initGame();
  } else if (participantsEvent.enabledParticipants.length == 2 && !againstAI) {
    console.log("init game, enough players\n");
    initGame();
    start();
  } else {
    console.log("still not enough players, bad\n");
  }
}

// Wait for gadget to load.
//gadgets.util.registerOnLoadHandler(init);
gadgets.util.registerOnLoadHandler(waiting);


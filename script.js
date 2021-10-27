const Misc = (function(){
  // creates a element with tagName and properties and children
  // example createELement(div, {class: 'big', id: '2'}) will return
  // <div class="big", id="2"></div>
  const createElement =  function(tagName, properties = {}, children = []) {
    let element = document.createElement(tagName);

    for(let property of Object.keys(properties)) {
      // set the attribute of element unlesss the value is falsey
      properties[property] && element.setAttribute(property, properties[property]);
    }

    for(let child of children) {
      element.appendChild(child);
    }

    return element;
  };

  const create2dArray = (y, x) {
    return array = new new Array(y).map(e => new Array(x));
  };

  const getBoardCells = function() {
    result = create2dArray(3, 3);

    for(let y = 0; y < result.length; y++) {
      for(let x = 0; x < result[y].length; x++) {
        result[y][x] = document.querySelector(`[data="${y} ${x}"]`);
      }
    }

    return result;
  };

  return {create2dArray, createElement};
})();

const EventEmitter = (function() {
  let uid = -1;
  const events = {};

  const on = (name, func) => {

    if(!events[name]) events[name] = [];
    events[name].push({id: ++uid, func: func});

    return uid;
  };

  const off = (name, id) => {
    if(!events[name]) return false;

    for(let i = 0; i < events[name].length; i++) { // using a normal loop so i can retuen from the loop
      event = events[name][i];

      if (id === event.id) {
        events[name].splice(i, 1);
        return true;
      }
    }

    return false;
  };

  const emit = (name, ...parameters) => {
    if (!events[name]) return false;

    events[name].forEach((event) => {
      event.func(...parameters);
    });

    return true;
  };

  return {on, off, emit};
})();

const boardFactory = function(){
  const boardArray = Misc.create2dArray(3, 3);
  const boardElement = document.querySelector('.board');
  const boardCells = createBoardCells();

  // create board cells in dom and returns an array containing the elements
  const createBoardCells = function() {
    result = Misc.create2dArray(3, 3);

    for(let y = 0; y < result.length; y++) {
      for(let x = 0; x < result[y].length; x++) {
        result[y][x] = createElement('button', {'data-index': `${y} ${x}`});
        boardElement.appendChild(result[y][x]);
      }
    }

    return result;
  };

  const render = function() {
    for(let y = 0; y < boardArray.length; y++) {
      for(let x = 0; x < boardArray[y].length; x++) {
        boardCells[y][x].textContent = boardArray[y][x] || '';
      }
    }
  };

  return { render, boardArray };
};

const playerFactory = function(name, token) {
  let isTurn = false; // to check when it is the turn of the player

  const boardCells = Misc.getBoardCells();
  boardCells.forEach(cell => cell.addEventListener('click', makeMove));

  EventEmitter.on('nextTurn', changeTurn);

  const makeMove = function(event) {
    if(!isTurn) return;

    move = // IMPLEMENT TOMORROW;

    EventEmitter.emit('playerMove' {player: self, move: move});
  };

  const changeTurn = function(event) {
    if (event.player !== self) return;

    isTurn = true;
  };

  return { self: this }
};

const computerFactory = function(difficulty) {
  const boardCells = Misc.getBoardCells();

  EventEmitter.on('nextTurn', makeMove);

  const makeMove = function(event) {
    move = // IMPLEMENT TOMMOROW;

    EventEmitter.emit('playerMove' {player: self, move: move});
  }

  return { self: this };
}

const gameFactory = function(board, players) {
  currentPlayerIndex = 0;

  const start = function() {
    EventEmitter.emit('nextTurn', {player: players[currentPlayerIndex], board: board.boardArray});
    EventEmitter.on('playerMove', makeMove);

    board.render();
  };

  const makeMove(event) {
    if (event.player !== players[currentPlayerIndex] ||
      !isValidMove(move, player)) return;

    player = event.player;
    board.update(move);
    board.render()

    if (isGameEnd()) endGame();

    EventEmitter.emit('nextTurn', {player: players[++currentPlayerIndex], board: board.boardArray});
  };

  return { start }
};
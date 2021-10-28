const sharedFuncs = (function(){
  // creates a element with tagName and properties and children
  // example createELement(div, {class: 'big', id: '2'}) will return
  // <div class="big", id="2"></div>
  const createElement =  (tagName, properties = {}, children = []) => {
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

  const create2dArray = (y, x) => {
    return new Array(y).fill().map(e => new Array(x));
  };

  const getBoardCells = () => {
    result = create2dArray(3, 3);

    for(let y = 0; y < result.length; y++) {
      for(let x = 0; x < result[y].length; x++) {
        result[y][x] = document.querySelector(`[data-index="${y} ${x}"]`);
      }
    }

    return result;
  };
  
  const isWin = (board, token) => {
    const lines = getLines(board);
    
    for(line of lines) {
      if(sharedFuncs.isSame(line, token)) return true;
    }
    
    return false;
  };
  
  const getLines = board => {
    const rows = board;
    const columns = getBoardColumns(board);
    const diagonals = getBoardDiagonals(board);
    
    return rows + columns + diagonals;
  };

  return {create2dArray, createElement, getBoardCells};
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
  // create board cells in dom and returns an array containing the elements
  const createBoardCells = function() {
    result = sharedFuncs.create2dArray(3, 3);

    for(let y = 0; y < result.length; y++) {
      for(let x = 0; x < result[y].length; x++) {
        result[y][x] = sharedFuncs.createElement('button', {'data-index': `${y} ${x}`});
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

  const boardArray = sharedFuncs.create2dArray(3, 3);
  const boardElement = document.querySelector('.board');
  const boardCells = createBoardCells();

  return { render, boardArray };
};

const playerFactory = function(name, token) {
  const makeMove = function(event) {
    if(!isTurn) return;

    move = getMove(event.target);

    EventEmitter.emit('playerMove', {player: self, move: move});
  };

  const getMove = function(cell) {
    let index = cell.getAttribute('data-index');
    let move = regex.exec(index).slice(1);
    return move;
  }

  const changeTurn = function(event) {
    if (event.player !== self) return;

    isTurn = true;
  };

  const addlistenersToCells = () => {
    boardCells.forEach(row => 
      row.forEach( cell => cell.addEventListener('click', makeMove))
    );
  }

  let isTurn = false; // to check when it is the turn of the player
  const regex = /(\d) (\d)/;

  const boardCells = sharedFuncs.getBoardCells();
  addlistenersToCells();

  EventEmitter.on('nextTurn', changeTurn);

  const self = {}; // so i will be able to refer to the player in the functions
  return self;
};

const computerFactory = function(difficulty) {
  const makeMove = (event) => {
    if (event.player !== self) return;

    move = getMove(event.board);
    EventEmitter.emit('playerMove', {player: self, move: move});
  };

  const getMove = (board) => {
    let move;

    switch (difficulty) {
      case 'easy':
        move = randomMove(board);
        break;
      case 'medium':
        move = findWinOrBlockingMove(board, opponent);
      case hard:
        minimaxMove(board, opponent);
      default:
        move = randomMove(board);
        break;
    }

    return move;
  };
  
  // Returns a move that will lead to a win if available
  // Or a move that blocks the opponent from winning.
  // if both are not available, returns a random move.
  const findWinOrBlockingMove = (board, opponent) => {
    let move = findWinningMove(board, self);
    if(move) return move;
    
    let move = findWinningMove(board, opponent);
    if(move) return move;
    
    return randomMove();
  };

  const findWinningMove = (board, player) => {
    moves = getPossibleMoves(board);
    
    for(move of moves) {
      newBoard = simulateMove(board, move, player.token);
      if(sharedFuncs.isWin(board, player.token)) return move;
    }
  };
  
  const simulateMove = (board, [y, x], token) => {
    boardCopy = sharedFuncs.deepCopy(board);
    boardCopy[y][x] = token;
    return boardCopy;
  };
  
  const boardCells = sharedFuncs.getBoardCells();

  EventEmitter.on('nextTurn', makeMove);

  const self = {};

  return self;
}

const gameFactory = function(board, players) {
  currentPlayerIndex = 0;

  const start = function() {
    EventEmitter.emit('nextTurn', {player: players[currentPlayerIndex], board: board.boardArray});
    EventEmitter.on('playerMove', makeMove);

    board.render();
  };

  const makeMove = (event) => {
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
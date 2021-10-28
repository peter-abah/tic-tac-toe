const helperFuncs = (function(){
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

  const randomElement = (array) => {
    array[Math.floor(Math.random() * array.length)];
  };

  const zip = function(rows) { // python zip equivalent
    return rows[0].map(
      (_, i) => rows.map(row => row[i])
    );
  };

  return {create2dArray, createElement, getBoardCells, randomElement, zip};
})();

const gameFuncs = (function(){
  const isWin = (board, token) => {
    const lines = getLines(board);
    
    for(line of lines) {
      if(helperFuncs.isSame(line, token)) return true;
    }
    
    return false;
  };
  
  const getLines = board => {
    const rows = board;
    const columns = getBoardColumns(board);
    const diagonals = getBoardDiagonals(board);
    
    return rows + columns + diagonals;
  };

  return {isWin}
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
    result = helperFuncs.create2dArray(3, 3);

    for(let y = 0; y < result.length; y++) {
      for(let x = 0; x < result[y].length; x++) {
        result[y][x] = helperFuncs.createElement('button', {'data-index': `${y} ${x}`});
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

  const boardArray = helperFuncs.create2dArray(3, 3);
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

  const boardCells = helperFuncs.getBoardCells();
  addlistenersToCells();

  EventEmitter.on('nextTurn', changeTurn);

  const self = {token}; // so i will be able to refer to the player in the functions
  return self;
};

const computerFactory = function(difficulty, token) {
  const makeMove = (event) => {
    if (event.player !== self) return;

    const opponent = event.players.filter(player => player != self)[0];

    move = getMove(event.board, opponent);
    EventEmitter.emit('playerMove', {player: self, move: move});
  };

  const getMove = (board, opponent) => {
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
      if(helperFuncs.isWin(board, player.token)) return move;
    }
  };
  
  const simulateMove = (board, [y, x], token) => {
    boardCopy = helperFuncs.deepCopy(board);
    boardCopy[y][x] = token;
    return boardCopy;
  };
  
  const randomMove = (board) => {
    moves = getPossibleMoves(board);
    return helperFuncs.randomElement(moves);
  }

  const getPossibleMoves = (board) => {
    indices = getIndices(board);
    return indices.filter(index => helperFuncs.isValidMove(index));
  }

  const getIndices = board => {
    result = [];
    board.forEach((row, y) =>
      row.forEach((cell, x) => result.push([y, x]))
    );
  }
  
  const boardCells = helperFuncs.getBoardCells();

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
'use strict';

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
    return new Array(y).fill().map(e => new Array(x).fill());
  };

  const getBoardCells = () => {
    const result = create2dArray(3, 3);

    for(let y = 0; y < result.length; y++) {
      for(let x = 0; x < result[y].length; x++) {
        result[y][x] = document.querySelector(`[data-index="${y} ${x}"]`);
      }
    }

    return result;
  };

  const randomElement = (array) => {
    return array[Math.floor(Math.random() * array.length)];
  };

  const zip = function(rows) { // python zip equivalent
    return rows[0].map(
      (_, i) => rows.map(row => row[i])
    );
  };

  const isSame = (array, element) => { // checks if all elements of array are the same as element
    return array.every(e => e === element);
  };

  // cloned an array even if it is multidimensional but 
  // doesn't clone the eleemnts that are not arrayys
  const deepArrayClone = value => {
    if (value instanceof Array) {
      return value.map(e => deepArrayClone(e))
    }

    return value;
  };

  return {
    create2dArray, createElement, getBoardCells, randomElement, zip, isSame, deepArrayClone
  };
})();

const gameFuncs = (function(){
  const isBoardFull = (board) => {
    return board.every(
      row => row.every(cell => cell));
  };

  const isValidMove = (board, [y, x]) => {
    return !board[y][x];
  };

  const isWin = (board, token) => {
    const lines = getLines(board);
    
    for(let line of lines) {
      if(helperFuncs.isSame(line, token)) return true;
    }
    
    return false;
  };
  
  const getLines = board => {
    const rows = board;
    const columns = getBoardColumns(board);
    const diagonals = getBoardDiagonals(board);

    return rows.concat(columns).concat(diagonals);
  };

  const getBoardColumns = board => {
    return helperFuncs.zip(board);
  };

  const getBoardDiagonals = board => {
    let b = board;

    return [
      [b[0][0], b[1][1], b[2][2]],
      [b[0][2], b[1][1], b[2][0]]
    ];
  };

  return {isValidMove, isWin, isBoardFull}
})();

const EventEmitter = (function() {
  let uid = -1;
  let events = {};

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

  const clearEvents = () => {
    events = {};
  }

  const emit = (name, ...parameters) => {
    if (!events[name]) return false;

    events[name].forEach((event) => {
      event.func(...parameters);
    });

    return true;
  };

  return {on, off, emit, clearEvents};
})();

const boardFactory = function(){
  const render = function() {
    for(let y = 0; y < self.boardArray.length; y++) {
      for(let x = 0; x < self.boardArray[y].length; x++) {
        boardCells[y][x].textContent = self.boardArray[y][x] || '';
      }
    }
  };

  const update = function([y, x], token) {
    let newBoardArray = helperFuncs.deepArrayClone(self.boardArray);
    newBoardArray[y][x] = token;
    self.boardArray = newBoardArray;
  };
  
  const reset = function() {
    self.boardArray = boardArray = helperFuncs.create2dArray(3, 3);
  }

  let boardArray = helperFuncs.create2dArray(3, 3);
  const boardElement = document.querySelector('.board');
  const boardCells = helperFuncs.getBoardCells();
  
  EventEmitter.on('newRound', reset)

  self = { render, update, boardArray };
  return self;
};

const playerFactory = function(name, token) {
  const makeMove = function(event) {
    if(!isTurn) return;

    const move = getMove(event.target);

    EventEmitter.emit('playerMove', {player: self, move: move});
  };

  const getMove = function(cell) {
    let index = cell.getAttribute('data-index');
    let move = regex.exec(index).slice(1);
    isTurn = false;
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
  };
  
  const reset = () => {
    isTurn = false;
  }

  let isTurn = false; // to check when it is the turn of the player
  const regex = /(\d) (\d)/;

  const boardCells = helperFuncs.getBoardCells();
  addlistenersToCells();

  EventEmitter.on('nextTurn', changeTurn);
  EventEmitter.on('newRound', reset);

  const self = {token}; // so i will be able to refer to the player in the functions
  return self;
};

const computerFactory = function(difficulty, token) {
  const makeMove = (event) => {
    if (event.player !== self) return;

    const opponent = event.players.filter(player => player != self)[0];

    const move = getMove(event.board, opponent);
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
        break;
      case 'hard':
        move = randomMove(board);
        break;
      default:
        move = randomMove(board);
        break;
    }

    return move;
  };

  const randomMove = (board) => {
    const moves = getPossibleMoves(board);
    return helperFuncs.randomElement(moves);
  };

  const getPossibleMoves = (board) => {
    const indices = getIndices(board);
    return indices.filter(index => gameFuncs.isValidMove(board, index));
  };

  const getIndices = board => {
    const result = [];
    board.forEach((row, y) =>
      row.forEach((cell, x) => result.push([y, x]))
    );

    return result;
  };
  
  // Returns a move that will lead to a win if available
  // Or a move that blocks the opponent from winning.
  // if both are not available, returns a random move.
  const findWinOrBlockingMove = (board, opponent) => {
    let move = findWinningMove(board, self);
    if(move) return move;
    
    move = findWinningMove(board, opponent);
    if(move) return move;
    
    return randomMove(board);
  };

  const findWinningMove = (board, player) => {
    const moves = getPossibleMoves(board);
    for(let move of moves) {
      let newBoard = simulateMove(board, move, player.token);
      if(gameFuncs.isWin(newBoard, player.token)) return move;
    }
  };
  
  const simulateMove = (board, [y, x], token) => {
    let boardCopy = helperFuncs.deepArrayClone(board);
    boardCopy[y][x] = token;
    return boardCopy;
  };

  EventEmitter.on('nextTurn', makeMove);

  const self = {token};
  return self;
};

const gameFactory = (board, players) => {
  const start = () => {
    EventEmitter.on('playerMove', makeMove);
    EventEmitter.on('newRound', reset);

    board.render();

    EventEmitter.emit('nextTurn', {
      player: players[currentPlayerIndex], board: board.boardArray, players: players
    });
  };

  const makeMove = (event) => {
    const move = event.move;

    if (event.player !== players[currentPlayerIndex] ||
      !gameFuncs.isValidMove(board.boardArray, move)) {
      EventEmitter.emit('nextTurn', 
        {player: players[currentPlayerIndex], board: board.boardArray, players: players}
      );
      return;
    }

    const player = event.player;
    board.update(move, player.token);
    board.render();

    if (isGameEnd()) {
      endGame();
      return;
    };

    currentPlayerIndex = (currentPlayerIndex + 1) % players.length;
    EventEmitter.emit('nextTurn', {player: players[currentPlayerIndex], board: board.boardArray, players: players});
  };

  const isGameEnd = () => {
    const player = players[currentPlayerIndex];
    if(gameFuncs.isWin(board.boardArray, player.token)) {
      winner = player;
      return true;
    }

    if(gameFuncs.isBoardFull(board.boardArray)) {
      isDraw = true;
      return true;
    }

    return false;
  };

  const endGame = () => {
    EventEmitter.emit('gameEnd', {winner, isDraw});
  };
  
  const reset = () => {
    currentPlayerIndex = 0;
    winner = undefined;
    isDraw = false;
    players.reverse();

    EventEmitter.emit('nextTurn', {player: players[currentPlayerIndex], board: board.boardArray, players: players});
    board.render();
  };

  let winner;
  let isDraw = false;

  let currentPlayerIndex = 0;

  return { start };
};

const gameUI = (() => {
  const addEventListenersToButtons = () => {
    playBtns.forEach(btn => 
      btn.addEventListener('click', showSelection)
    );

    computerSelectBtns.forEach(btn => 
      btn.addEventListener('click', computerStart)
    );

    newGameBtn.addEventListener('click', newGame);
    newRoundBtn.addEventListener('click', newRound);
  };

  const showSelection = event => {
    let gameType = event.target.getAttribute('data-game-type');

    if (gameType === 'human') {
      [startArea, gameArea].forEach(elem => elem.classList.toggle('hidden'));
      startGame(gameType);
      return;
    }

    [startArea, computerSelection].forEach(elem => elem.classList.toggle('hidden'));
  }

  const computerStart = event => {
    let mode = event.target.getAttribute('data-mode');
    [computerSelection, gameArea].forEach(elem => elem.classList.toggle('hidden'));
    startGame('computer', mode);
  }

  const startGame = (gameType, mode) => {
    let board = boardFactory();
    let player1 = playerFactory('', 'X');
    let player2 = gameType === 'computer' ? computerFactory(mode, 'O') : playerFactory('', 'O');
    let game = gameFactory(board, [player1, player2]);

    game.start()
  };

  const newGame = event => {
    EventEmitter.clearEvents();
    [startArea, gameArea].forEach(elem => elem.classList.toggle('hidden'));
    init();
  };

  const newRound = event => {
    EventEmitter.emit('newRound');
  };

  const displayMessage = ({player, winner, isDraw}) => {
    if (winner) {
      messageArea.textContent = `${winner.token} won this round`;
    } else if (isDraw) {
      messageArea.textContent = 'Draw!!!';
    } else {
      messageArea.textContent = `${player.token}'s turn`;
    }
  };

  const init = () => {
    EventEmitter.on('nextTurn', displayMessage);
    EventEmitter.on('gameEnd', displayMessage);
  };

  const startArea = document.querySelector('.start');
  const gameArea = document.querySelector('.game');
  const computerSelection = document.querySelector('.computer-selection')
  const messageArea = document.querySelector('.game__message')

  const playBtns = [...document.querySelectorAll('.start__button')];
  const computerSelectBtns = [...document.querySelectorAll('.computer-selection__btn')]
  const newGameBtn = document.getElementById('new-game-btn');
  const newRoundBtn = document.getElementById('new-round-btn');

  addEventListenersToButtons();
  init();
})();
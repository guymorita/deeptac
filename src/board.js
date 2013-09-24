
var TTT = {};

TTT.Board = Backbone.Model.extend({
  initialize: function(){
    _.bindAll(this, 'newBoard', 'notatedMoves', 'recordMove', 'moveCombinations');
    this.newBoard();
  },

  newBoard: function(){
      this.boardGrid = '000000000';
  },

  playerMove: function(position){
    this.recordMove(position, 1);
    // this.randomComputerMove();
    this.smartComputerMove();
    this.scoreBoard(this.boardGrid);
    this.minMax(this.boardGrid, 0, 1, true);
  },

  randomComputerMove: function(){
    var position = Math.floor(Math.random()*9);
    try {
      this.recordMove(position, 4);
    } catch (e){
      this.randomComputerMove();
      console.log('error', e);
    }
  },

  smartComputerMove: function(){
    var nextComputerMove = this.minMax(this.boardGrid, 0, 4, true);
    var nextMove = this.translateNewMove(nextComputerMove);
    this.recordMove(nextMove.position, nextMove.player);
  },

  translateNewMove: function(newBoard){
    for (var i = 0; i < newBoard.length; i++){
      if (newBoard[i] !== this.boardGrid[i]){
        return {
          player: newBoard[i],
          position: i
        }
      }
    }
  },

  notatedMoves: function(){
    var moves = {};
    for (var i = 0; i < 9; i++){
      moves['t'+i] = this.boardGrid[i];
    }
    return moves;
  },

  recordMove: function(position, player){
    var gridPosition = this.boardGrid[position];
    if (gridPosition === '0'){
      var startBoard = this.boardGrid.slice(0 , Number(position));
      var endBoard = this.boardGrid.slice(Number(position) + 1, 9);
      this.boardGrid = '' + startBoard + player + endBoard;
      this.trigger('moved');
    } else {
      throw 'Space taken';
    }
  },

  scoreBoard: function(board){
    var score = 0;
    var tempScore = 0;

    var scoreChange = function(tempScore){
      if (tempScore === 1){
        score += 1;
      } else if (tempScore === 4){
        score -= 1;
      } else if (tempScore === 2){
        score += 10;
      } else if (tempScore === 8){
        score -= 10;
      } else if (tempScore === 3){
        score += 100;
      } else if (tempScore === 12){
        score -= 100;
      }
    }

    var checkRows = function(){
      for (var i = 0; i < 9; i+=3){
        tempScore = Number(board[i]) + Number(board[i+1]) + Number(board[i+2]);
        scoreChange(tempScore);
      }
    };

    var checkColumns = function(){
      for (var i = 0; i < 3; i++){
        tempScore = 0;
        for (var j = 0; j < 9; j+=3){
          tempScore += Number(board[i+j]);
        }
        scoreChange(tempScore);
      }
    };

    var checkDiagonals = function(){
      var majorDiagonal = Number(board[0]) + Number(board[4]) + Number(board[8]);
      var minorDiagonal = Number(board[2]) + Number(board[4]) + Number(board[6]);
      scoreChange(majorDiagonal);
      scoreChange(minorDiagonal);
    };

  checkRows();
  checkColumns();
  checkDiagonals();

  return score;

  },

  positionZeros: function(str){
    var positions = [];
    for (var i = 0; i < str.length; i++){
      if (str[i] === '0'){
        positions.push(i);
      }
    }
    return positions;
  },

  moveCombinations: function(source, list, seed){
    var zeros = this.positionZeros(source);
    for (var i = 0; i < zeros.length; i++){
      var oneSource = source.slice(0,zeros[i]) + seed + source.slice(zeros[i]+1, source.length);
      list.push(oneSource);
    }
  },


  minMax: function(board, depth, seed, isFirst){
    // minMax('400100114', 0, 1); return '410100114' bestBoard for seed player
    isFirst = isFirst || false;
    var score = this.scoreBoard(board);
    if (depth === 2 || Math.abs(score) > 50){
      return score;
    } else {
      var listOfCombos = [];
      this.moveCombinations(board, listOfCombos, seed);
      var bestScore, bestChild;
      for (var i = 0; i < listOfCombos.length; i++){
        var currentChild, currentScore;
        if (seed === 1){
          currentScore = this.minMax(listOfCombos[i], depth+1, 4, false);
          if (typeof bestScore === 'undefined' || bestScore < currentScore){
            bestScore = currentScore;
            if (isFirst){
              bestChild = listOfCombos[i];
            }
          }
        } else if (seed === 4){
          currentScore = this.minMax(listOfCombos[i], depth+1, 1, false);
          if (typeof bestScore === 'undefined' || bestScore > currentScore){
            bestScore = currentScore;
            if (isFirst){
              bestChild = listOfCombos[i];
            }
          }
        }
      }
      return (isFirst) ? bestChild : bestScore;
    }
  }
});

TTT.BoardView = Backbone.View.extend({
  el: $('body'),

  initialize: function(){
    this.model.on('moved', function(){
      this.render();
    }, this);
  },

  events: {
    'click div.square': 'playerClick'
  },

  playerClick: function(){
    var position = $(event.target).attr('id');
    this.model.playerMove(position[1]);
  },

  render: function(){
    var notatedMoves = this.model.notatedMoves();
    for (var key in notatedMoves){
      if (notatedMoves[key] === '1'){
        $(this.el).find('#'+key).html('X');
      } else if (notatedMoves[key] === '4'){
        $(this.el).find('#'+key).html('O');
      }
    }
  }



});
TTT.ScoreView = Backbone.View.extend({
  initialize: function(){

  }
})
var board = new TTT.Board({});
var boardView = new TTT.BoardView({model: board});

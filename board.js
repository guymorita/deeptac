
(function(){

  var TTT = {};

  TTT.Board = Backbone.Model.extend({
    initialize: function(){
      _.bindAll(this, 'newBoard', 'notatedMoves', 'recordMove', 'combos');
      this.newBoard();
    },

    newBoard: function(){
      this.boardGrid = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
      ];
    },

    allRotations: function(){

    },


    playerMove: function(position){
      this.recordMove(position, 1);
      this.randomComputerMove();
      this.scoreBoard(this.boardToString(this.boardGrid));
      this.minMax(this.boardToString(this.boardGrid), 0, 1);
    },

    randomComputerMove: function(){
      var randomRow = function(){
        return ['a', 'b', 'c'][Math.floor((Math.random()*3))];
      };

      var randomColumn = function(){
        return [1,2,3][Math.floor((Math.random()*3))];
      };

      var position = '' + randomRow() + randomColumn();

      try {
        this.recordMove(position, 4);
      } catch (e){
        this.randomComputerMove();
        console.log('error', e);
      }
    },

    smartComputerMove: function(){
      // rotate the grid until it sees a pattern it recognizes
      // record how much it was rotated and if it was mirrored
      // use logic gate to determine next move
      // rotate that decision back
    },

    notatedMoves: function(){
      var rows = ['a', 'b', 'c'];
      var columns = [1,2,3];

      var moves = {};

      for (var i = 0; i < 3; i++){
        for (var j = 0; j < 3; j++){
          var row = rows[i];
          var column = columns[j];
          moves[''+row+column] = this.boardGrid[i][j];
        }
      }

      return moves;
    },

    recordMove: function(position, player){
      var row = {
        a: 0,
        b: 1,
        c: 2
      };

      var column = {
        1: 0,
        2: 1,
        3: 2
      };

      var gridRow = row[position[0]];
      var gridColumn = column[position[1]];

      var gridPosition = this.boardGrid[gridRow][gridColumn];

      if (!gridPosition){
        this.boardGrid[gridRow][gridColumn] = player;
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

    console.log('score', score);
    return score;

    },

    boardToString: function(board){
      var str = '';
      for (var i = 0; i < board.length; i++){
        for (var j = 0; j < board[i].length; j++){
          str += board[i][j];
        }
      }
      console.log(str);
      return str;
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

    combos: function(source, list, seed){
      var zeros = this.positionZeros(source);
      for (var i = 0; i < zeros.length; i++){
        var oneSource = source.slice(0,zeros[i]) + seed + source.slice(zeros[i]+1, source.length);
        list.push(oneSource);
      }
    },

    minMax: function(board, depth, seed){
      // minMax('400100114', 0, 1); return '410100114' bestBoard for seed player
      var score = this.scoreBoard(board);
      if (depth === 2 || Math.abs(score) > 50){
        console.log('game over board', board);
        return board;
      } else {
        var listOfCombos = [];
        this.combos(board, listOfCombos, seed);
        console.log('list combos', listOfCombos);
        var bestScore, bestChild;
        // for (var i = 0; i < listOfCombos.length; i++){
        for (var i = 0; i < 2; i++){
          console.log('checking option', i);
          var currentChild, currentScore;
          if (seed === 1){
            console.log('list combo input', listOfCombos[i]);
            currentChild = this.minMax(listOfCombos[i], depth+1, 4);
            console.log('currentChild', currentChild);
            currentScore = this.scoreBoard(currentChild);
            if (typeof bestScore === 'undefined' || bestScore < currentScore){
              bestScore = currentScore;
              bestChild = currentChild;
            }
          } else if (seed === 4){
            console.log('list combo input', listOfCombos[i]);
            currentChild = this.minMax(listOfCombos[i], depth+1, 1);
            console.log('currentChild', currentChild);
            currentScore = this.scoreBoard(currentChild);
            if (typeof bestScore === 'undefined' || bestScore > currentScore){
              bestScore = currentScore;
              bestChild = currentChild;
            }
          }
          console.log('best score', bestScore);
        }
        console.log('blank child', currentChild);
        console.log('bestChild', bestChild);
        console.log('bestScore', bestScore);
        return bestChild;
      }
    }


  });


  TTT.BoardView = Backbone.View.extend({
    el: $('body'),

    initialize: function(){
      this.model.on('moved', function(){
        this.render();
      }, this);
      this.model.randomComputerMove();

    },

    events: {
      'click div.square': 'playerClick'
    },

    playerClick: function(){
      var position = $(event.target).attr('id');
      this.model.playerMove(position);
    },

    render: function(){
      var notatedMoves = this.model.notatedMoves();
      for (var key in notatedMoves){
        $(this.el).find('#'+key).html(notatedMoves[key]);
      }
    }
  });

  var board = new TTT.Board({});
  var boardView = new TTT.BoardView({model: board});

}());

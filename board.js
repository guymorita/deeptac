
(function(){

  var TTT = {};

  TTT.Board = Backbone.Model.extend({
    initialize: function(){
      console.log('board initiated');
      this.boardGrid = [
        [0,0,0],
        [0,0,0],
        [0,0,0]
      ];

      _.bindAll(this, 'checkWinner');
    },

    newBoard: function(){

    },

    playerMove: function(position){
      this.recordMove(position, 1);
      this.computerMove();
      this.checkWinner(function(winner){
        console.log('winner', winner);
      });
    },

    computerMove: function(){
      var randomRow = function(){
        return ['a', 'b', 'c'][Math.floor((Math.random()*3))];
      };

      var randomColumn = function(){
        return [1,2,3][Math.floor((Math.random()*3))];
      };

      var position = '' + randomRow() + randomColumn();

      try {
        this.recordMove(position, 2);
      } catch (e){
        this.computerMove();
        console.log('error', e);
      }
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

      console.log(gridRow, gridColumn);

      var gridPosition = this.boardGrid[gridRow][gridColumn];

      if (!gridPosition){
        this.boardGrid[gridRow][gridColumn] = player;
        console.log(this.boardGrid);
      } else {
        throw 'Space taken';
      }
    },

    checkWinner: function(callback){
      var playerScoreNeeded = 3;
      var computerScoreNeeded = 6;

      var winner;

      var _this = this;

      var scoreTest = function(score){
        if (score === 3){
          winner = 'player';
        } else if (score === 6){
          winner = 'computer';
        }
      };

      var score = 0;

      var checkRows = function(){
        for (var i = 0; i < 3; i++){
          score = _this.boardGrid[i][0] + _this.boardGrid[i][1] + _this.boardGrid[i][2];
          scoreTest(score);
        }
      };

      var checkColumns = function(){
        for (var i = 0; i < 3; i++){
          score = 0;
          for (var j = 0; j < 3; j++){
            score += _this.boardGrid[j][i];
          }
          scoreTest(score);
        }
      };

      var checkDiagonals = function(){
        var majorDiagonal = _this.boardGrid[0][2] + _this.boardGrid[1][1] + _this.boardGrid[2][0];
        var minorDiagonal = _this.boardGrid[0][0] + _this.boardGrid[1][1] + _this.boardGrid[2][2];

        scoreTest(majorDiagonal);
        scoreTest(minorDiagonal);
      };

      checkRows();
      checkColumns();
      checkDiagonals();

      if (winner){
        callback(winner);
      } else {
        callback('noWinner');
      }
    }
  });


  TTT.BoardView = Backbone.View.extend({
    el: $('body'),

    initialize: function(){
      console.log(this.model)
      this.model.on('change', function(){
        console.log('model changed');
      });

    },

    events: {
      'click div.square': 'playerClick'
    },

    playerClick: function(){
      var position = $(event.target).attr('id');
      this.model.playerMove(position);
    }
  });
  var board = new TTT.Board();
  var boardView = new TTT.BoardView({model: board});

}())

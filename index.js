// A piece has to be a function expecting and invoking-when-done a callback keeping the chain going

module.exports = Pipe;

function Pipe () {
  this._pieces = [];
  this._locked = false;
}

Pipe.prototype.placeFirst = function (piece) {
  this._pieces.unshift(piece);
};

Pipe.prototype.place = function (piece) {
  if (this._locked) {
    throw new Error("Cannot add pieces after pipeline has been flooded!");
  }

  this._pieces.push(piece);
};

Pipe.prototype.placeLast = function (piece) {
  this.place(piece);
};

Pipe.prototype.flood = function (data) {
  var self = this;
  var ctx = {
    piecesPassed: -1,
    abort: function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(ctx);
      self.onAborted.apply(self, args);
    }
  };

  this._locked = true;

  var args = Array.prototype.slice.call(arguments);
  args.unshift(0);
  floodRec.apply(this, args);

  function floodRec (index) {
    ctx.piecesPassed++;
    var args = Array.prototype.slice.call(arguments);
    args.shift(); //Remove the first parameter (index)

    if (index >= this._pieces.length) {
      args.unshift(ctx);
      this.onFinished.apply(this, args);
      return;
    }

    var piece = this._pieces[index];
    args.unshift(floodRec.bind(this, ++index));
    piece.apply(ctx, args);
  }
};

//Might receive more than just one data parameter - this depends on the pieces-functions used
//When overwriting this function attention should be payed to "arguments" variable
Pipe.prototype.onFinished = function (cxt, data) {
  console.log("Done!");
};

Pipe.prototype.onAborted = function (cxt, data) {
  console.log("Called!");
};

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
  var ctx = {
    piecesPassed: -1
  };
  this._locked = true;
  arguments.unshift(0);
  floodRec.apply(this, arguments);

  function floodRec (index) {
    ctx.piecesPassed++;
    var args = arguments.shift(); //Remove the first parameter (index)

    if (index >= this._pieces.length) {
      this.onFinished(ctx, args);
    }

    var piece = this._pieces[index];
    args.unshift(floodRec.bind(this, ++index));
    piece.apply(ctx, args);
  }
};

Pipe.prototype.onFinished = function (cxt) {
  console.log("Done!");
};

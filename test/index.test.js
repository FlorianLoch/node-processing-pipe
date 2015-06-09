var expect = require("chai").expect;
var Pipe = require("../index.js");

describe("processing-pipe", function () {
    var instance;

    beforeEach(function () {
      instance = new Pipe();
    });

    it("shall invoke function in correct order and raise cxt.piecesPassed", function (done) {
      var calledPieces = 0;

      instance.place(function (next) {
        expect(this.piecesPassed).to.equal(1);
        calledPieces++;
        next();
      });
      instance.place(function (next) {
        expect(this.piecesPassed).to.equal(2);
        expect(calledPieces).to.equal(2);
        next();
      });
      instance.placeFirst(function (next) {
        expect(this.piecesPassed).to.equal(0);
        calledPieces++;
        next();
      });

      instance.onFinished = function (cxt) {
        expect(cxt.piecesPassed).to.equal(3);
        done();
      };

      instance.flood();
    });

    it("shall handle given parameters correctly", function (done) {
      instance.place(function (next, data) {
        expect(data.myValue).to.equal("Hello");
        data.myValue += " World";
        next(data);
      });
      instance.place(function (next, data) {
        data.myValue += "!";
        next(data);
      });

      instance.onFinished = function (cxt, data) {
        expect(cxt.piecesPassed).to.equal(2);
        expect(data.myValue).to.equal("Hello World!");
        done();
      };
    });
});

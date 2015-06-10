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

      instance.onDone = function (cxt) {
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
        expect(data.myValue).to.equal("Hello World");
        data.myValue += "!";
        next(data);
      });

      instance.placeLast(function (nxt, data) {
        expect(this.piecesPassed).to.equal(2);
        expect(data.myValue).to.equal("Hello World!");
        done();
      });

      instance.flood({
        myValue: "Hello"
      });
    });

    it("shall be possible to abort execution of pipe", function (done) {
      instance.place(function (next, data1, data2) {
        data1.a = 3;
        data2.a = 5;
        next(data1, data2);
      });

      instance.place(function (next, data1, data2) {
        data1.b = data1.a + data2.a;
        this.abort(data1, data2);
      });

      var origOnAborted = instance.onAborted;
      instance.onAborted = function (cxt, data1, data2) {
        origOnAborted.apply(instance, arguments);
      };

      instance.onEnded = function (cxt, data1, data2) {
        expect(data1.b).to.equal(8);
        expect(data2.a).to.equal(5);
        done();
      }

      instance.flood({}, {});
    });

    it("shall of course be possible to use ctx for all data handover - custom parameter are not needed", function (done) {
      instance.place(function (next) {
        this.value = 1;
        next();
      });

      instance.place(function (next) {
        this.value++;
        next();
      });

      instance.onEnded = function (ctx) {
        expect(ctx.value).to.equal(2);
        done();
      };

      instance.flood();
    });

    it("shall not be possible to add pieces after pipe has been flooded", function () {
      var errorCaught = false;

      instance.place(function (next) {
        next();
      });

      expect(instance._pieces.length).to.equal(1);

      instance.flood();

      try {
        instance.place(function (next) {
          next();
        });
      } catch (err) {
          errorCaught = true;
      }

      expect(errorCaught).to.be.true;
      expect(instance._pieces.length).to.equal(1);
    });
});

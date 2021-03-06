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

      instance.onDone = function (err, ctx) {
        expect(ctx.piecesPassed).to.equal(3);
        expect(ctx.aborted).to.be.false;
        expect(err).to.be.null;
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

      instance.onDone = function (err, ctx, data1, data2) {
        expect(err).to.be.null;
        expect(ctx.aborted).to.be.true;
        expect(data1.b).to.equal(8);
        expect(data2.a).to.equal(5);
        done();
      };

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

      instance.onDone = function (err, ctx) {
        expect(ctx.aborted).to.be.false;
        expect(err).to.be.null;
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

    it("shall be possible to stop execution (abort) by handing over an instance of Error as first parameter to next()", function (done) {
      instance.place(function (next) {
        next();
      });

      instance.place(function (next) {
        next(new Error("foobar!"));
      });

      instance.onDone = function (err, ctx) {
        expect(ctx.aborted).to.be.true;
        expect(err.message).to.be.equal("foobar!");
        expect(ctx.piecesPassed).to.equal(2);
        done();
      };

      instance.flood();
    });

    it("shall be possible to compare to functions", function () {
      var func1 = function () {};
      var func2 = function () {};

      expect(func1 == func1).to.be.true;
      expect(func1 == func2).to.be.false;
    });

    it("shall be possible to set onDone via optional, second parameter of flood(). The algorithm shall also work for empty pipes", function (done) {
      var handler = function (err, ctx, data) {
        expect(data).to.equal("helloData");
        expect(instance.onDone == handler).to.be.true;
        expect(ctx.piecesPassed).to.equal(0);
        done();
      };
      instance.flood("helloData", handler);
    });
});

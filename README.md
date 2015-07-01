[![Build Status](https://api.shippable.com/projects/557888b9edd7f2c052106aef/badge?branchName=master)](https://app.shippable.com/projects/557888b9edd7f2c052106aef/builds/latest)
[![Code Climate](https://codeclimate.com/github/FlorianLoch/node-processing-pipe/badges/gpa.svg)](https://codeclimate.com/github/FlorianLoch/node-processing-pipe)
[![Test Coverage](https://codeclimate.com/github/FlorianLoch/node-processing-pipe/badges/coverage.svg)](https://codeclimate.com/github/FlorianLoch/node-processing-pipe/coverage)

# About this module
This is another module aiming at making asynchronous code more readable and easy to use. Its main purpose is to enable you to construct a chain of (asynchronous) function calls and invoke it afterwards via a simple API. The code is well tested and therefore expected to be ready for production.

# Installation
```
npm i processing-pipe --save

```

# API
## Signature of 'chain'-function
```javascript
function chainable(next, data, as, much, further, variables, as, you, like) {
  next(hand, over, all, variables, you, need);
}  
```
Actually just ```next``` is needed - it will be given the generated %Bindeglied% function that will do the work of correct invocation of the next chain item for you. It has to be once in your code or the chain will break. It shouldn't be called more than once.
```this``` is set to a context variable provided by the library to enable access to methods like ```abort()```. If you need ```this``` to point to instance a method is bound to you might wrap the function with another function. Using ```bind()``` will also work.
If the first parameter given to it is an instance of ```Error``` processing will be aborted the same way ```this.abort()``` (further down this document) would do it.

## Construct new instance
```javascript
var Pipe = require("processing-pipe");
var p = new Pipe();
```

## Add chainable element
```javascript
var chainableFunction = function (next, data) {
  //Process data
  next(data);
};

p.place(chainableFunction); //Places the given element at the end of the pipe
p.placeLast(chainableFunction); //This is just an alias for place()
p.placeFirst(chainableFunction); //Places the given item at the beginning of the pipeline
```
The methods ```place()```, ```placeLast()``` and ```placeFirst()``` might be used for adding elements to any ```Pipe``` instance.

## Start processing
```javascript
p.flood(data, function (err, data, ctx) {});
```
The first parameter given to ```flood()``` will be handed over as the 2nd parameters to the first element in the chain. The second parameter might contain the final callback function which gets invoked after...:
- ... the chain successfully completed
- ... an error occurred and gets handled via ```next(error)```
- ... processing gets aborted via ```this.abort()```.
```ctx``` refers to the object which is bound to the chainable function as ```this```. ```ctx.piecesPassed``` contains the number of successfully passed chain-items.
s```ctx.aborted``` gives information (boolean) whether the chain has been successfully completed or aborted (due to ```abort()``` or an error).

## Error handling and aborting
Processing might be aborted by calling ```this.abort()``` inside chain function. In case this is not reachable or an error occured one can call ```done``` with an instance of ```Error``` as first parameter. In both cases ```ctx.aborted``` (which can be accessed in ```onDone``` handler) is set to ```true```.

# License
The MIT License (MIT)

Copyright (c) 2015 Florian Loch

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.

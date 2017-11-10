Apex: Threading Component
=========================

> (!) work in progress.

Providers native multi-threading support using web workers.  
Requires electron where `nodeIntergration` and `nodeIntegrationInWorker` is enabled.

## Installation

Using npm:
```bash
$ npm i apex-threading --save
```

Using yarn:
```bash
$ yarn add apex-threading
```

## Usage

See [this example](test/test.html) for a test using prime number generation.

```javascript
const my_thread = new Threading.Thread(() => {
    // This code runs in a thread and in its own scope. Parent variables/scopes are
    // unavailable here.
    
    on('upper', (str) => {
        emit('upper-result', str.toString().toUpperCase());
    });
});

my_thread.on('upper-result', (str) => {
    console.log('Response from thread: ', str);
});

// Sending a message on a thread that has not been started yet, will start it automatically.
my_thread.send('upper', 'hello world');
// > "Response from thread: HELLO WORLD

// Kill the thread.
my_thread.terminate();

// Start it again if you want.
my_thread.start();
```

## Threads

A thread is defined by a function body. The function may be defined anonymously (inline) as seen in the example above,
or an external file where a function is exposed using `module.exports` and required in the function argument.

The function runs in a separate scope, meaning that _this wil not work_:
```javascript
const a = 1234;
const t = new Thread(() => {
    console.log(a); // undefined
});
```

A thread has two global functions that it can use to communicate back and forth with the main process:
- `on(type, callback)`
- `emit(type, data)`

The same functionality is also available on the `Thread` instance, but instead of using `emit`, you'll have to use
`send` with the same syntax.

For example:
```javascript
const my_thread = new Thread(() => {
    on('to-upper', (str) => {
        emit('to-upper-result', str.toString().toUpperCase());
    });
});

my_thread.on('to-upper-result', (str) => {
    console.log('result: ', str);
});

my_thread.send('to-upper', 'hello world');
```

## Global listeners.
If you spawn a lot of threads with the same features (like logging for example), you might want to add a listener to all
available threads simultaneously. You can do this by using the `ThreadPool`. This will only work on threads spawned by
the `ThreadPool`.

```javascript
const Threading = require('apex-threading');

Threading.ThreadPool.spawn('thread_1', require('./thread-script.js'));
Threading.ThreadPool.spawn('thread_2', require('./thread-script.js'));
Threading.ThreadPool.spawn('thread_3', require('./thread-script.js'));

Threading.ThreadPool.on('log', (type, message) => {
    console.log('[' + type + ']: ', message);
});
```

In the example above, if any thread executes `emit('log', 'some message')`, it will be picked up by that one listener.

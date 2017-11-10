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

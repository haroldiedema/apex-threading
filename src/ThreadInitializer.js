/* APEX Framework: Threading Component             _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

let onmessage;

module.exports = function () {

    let Thread = {
        __self              : null,
        __message_listeners : {}
    };

    onmessage = function (e) {
        // Initializer
        if (typeof e.data === 'object' && e.data.type === '--init' && Thread.__self === null) {
            if (typeof module !== 'undefined') {
                module.paths = e.data.module_paths;
            }
            Thread.__self = new Function('on, emit', e.data.thread_fn);
            Thread.__self.call(
                Thread,

                // on
                function (type, callback) {
                    if (typeof type !== 'string') {
                        throw new Error('"on()" expects argument #1 to be a string, got ' + (typeof type) + ' instead.');
                    }
                    if (typeof callback !== 'function') {
                        throw new Error('onMessage expects argument #2 to be a function, got ' + (typeof callback) + ' instead.');
                    }
                    if (typeof Thread.__message_listeners[type] === 'undefined') {
                        Thread.__message_listeners[type] = [];
                    }
                    Thread.__message_listeners[type].push(callback);
                },

                // emit
                function (type, data) {
                    if (typeof type !== 'string') {
                        throw new Error('"emit()" expects argument #1 to be a string, got ' + (typeof type) + ' instead.');
                    }
                    return postMessage({type: type, data: data});
                }
            );
            return;
        }

        (Thread.__message_listeners[e.data.type] || []).forEach((callback) => {
            callback(e.data.data);
        });
    };
};

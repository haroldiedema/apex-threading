/* APEX Framework: Threading Component             _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

class Thread
{
    /**
     * @param {Function} threaded_function
     */
    constructor (threaded_function, resolve_paths)
    {
        Object.defineProperty(this, '$', {enumerable: false, value: {}});

        this.$._thread_f      = threaded_function.toString();
        this.$._thread_i      = require('./ThreadInitializer').toString();
        this.$._thread_f      = this.$._thread_f.slice(this.$._thread_f.indexOf('{') + 1, this.$._thread_f.lastIndexOf('}'));
        this.$._thread_i      = this.$._thread_i.slice(this.$._thread_i.indexOf('{') + 1, this.$._thread_i.lastIndexOf('}'));
        this.$._blob          = new Blob([this.$._thread_i], {type: 'application/javascript'});
        this.$._resolve_paths = (typeof resolve_paths === 'string' ? [resolve_paths] : resolve_paths) || [];
        this.$._running       = false;
        this.$._instance      = undefined;
        this.$._listeners     = {};
    }

    /**
     * Starts the thread.
     */
    start ()
    {
        if (this.$._instance) {
            throw new Error('Thread already started.');
        }

        let resolve_paths = module.paths;
        this.$._resolve_paths.forEach((p) => {
            resolve_paths.unshift(p);
        });

        this.$._instance = new Worker(window.URL.createObjectURL(this.$._blob));
        this.$._instance.postMessage({
            type:         '--init',
            module_paths: resolve_paths,
            thread_fn:    this.$._thread_f
        });
        this.$._instance.onmessage = (e) => {
            (this.$._listeners[e.data.type] || []).forEach((listener) => {
                listener(e.data.data);
            });
        };
        this.$._instance.onerror   = (e) => {
            throw e;
        };
    }

    /**
     * Executes the given callback function when a message of the given type is received from the thread.
     *
     * @param {String}   type
     * @param {Function} callback
     */
    on (type, callback)
    {
        if (typeof this.$._listeners[type] === 'undefined') {
            this.$._listeners[type] = [];
        }
        this.$._listeners[type].push(callback);
    }

    /**
     * @param {String} type
     * @param {Object} data
     */
    send (type, data)
    {
        if (!this.$._instance) {
            this.start();
        }

        this.$._instance.postMessage({type: type, data: data});
    }

    /**
     * Returns true if the thread is currently running.
     *
     * @returns {Boolean}
     */
    isRunning ()
    {
        return typeof this.$._instance !== 'undefined';
    }

    /**
     * Terminates the running thread.
     */
    terminate ()
    {
        if (!this.$._instance) {
            return;
        }

        this.$._instance.terminate();
        this.$._instance = undefined;
    }
}

module.exports = Thread;

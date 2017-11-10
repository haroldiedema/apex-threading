/* APEX Framework: Threading Component             _______
 *                                                 ___    |________________  __
 * Copyright 2017, Harold Iedema                   __  /| |__  __ \  _ \_  |/_/
 * <harold@iedema.me>                              _  ___ |_  /_/ /  __/_>  <
 * Licensed under MIT.                             /_/  |_|  .___/\___//_/|_|
 * ----------------------------------------------------- /_*/
'use strict';

const Thread      = require('./Thread'),
      __threads   = {},
      __listeners = {};

module.exports = {
    /**
     * Spawns a new thread with the given identifier and function.
     *
     * @param {String}   identifier
     * @param {Function} thread_function
     */
    spawn: function (identifier, thread_function)
    {
        if (typeof __threads[identifier] !== 'undefined') {
            throw new Error('Another thread with the identifier "' + identifier + '" is already present.');
        }
        __threads[identifier] = new Thread(thread_function);

        // Add global listeners to the newly spawned thread.
        Object.keys(__listeners).forEach((type) => {
            __listeners[type].forEach((callback) => {
                __threads[identifier].on(type, callback);
            });
        });
    },

    /**
     * Returns a thread by the given identifier.
     *
     * @param   {String} identifier
     * @returns {Thread}
     */
    get: function (identifier)
    {
        if (typeof __threads[identifier] === 'undefined') {
            throw new Error('There is no thread with identifier "' + identifier + '".');
        }

        return __threads[identifier];
    },

    /**
     * Removes a thread by the given identifier.
     * If the thread is currently running, it will be terminated prior to removal.
     *
     * @param {String} identifier
     */
    remove: function (identifier)
    {
        if (typeof __threads[identifier] === 'undefined') {
            throw new Error('There is no thread with identifier "' + identifier + '".');
        }

        if (__threads[identifier].isRunning()) {
            __threads[identifier].terminate();
        }

        delete __threads[identifier];
    },

    /**
     * Stops and removes all active threads.
     */
    removeAll ()
    {
        Object.keys(__threads).forEach((id) => {
            if (__threads[id].isRunning()) {
                __threads[id].stop();
            }
            delete __threads[id];
        });
    },

    /**
     * @param {String}   type
     * @param {Function} callback
     */
    on (type, callback)
    {
        if (typeof __listeners[type] === 'undefined') {
            __listeners[type] = [];
        }
        __listeners[type].push(callback);

        // Assign listener to existing threads.
        Object.values(__threads).forEach((thread) => {
            thread.on(type, callback);
        });
    }
};

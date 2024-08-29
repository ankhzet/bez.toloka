/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const jQuery = __webpack_require__(13);
	const port_1 = __webpack_require__(2);
	const actions_1 = __webpack_require__(3);
	class TolokaChannel extends port_1.ClientPort {
	    constructor() {
	        super('toloka');
	        this.touched = 0;
	        let uid = JSON.parse(sessionStorage.getItem("beztoloka-channel"));
	        if (uid)
	            this.uid = uid;
	        else
	            sessionStorage.setItem("beztoloka-channel", JSON.stringify(this.uid));
	    }
	    resolve(uri) {
	        return `https://toloka.yandex.ru/api/${uri}`;
	    }
	    requestConnect() {
	        if (!this.rebind())
	            return false;
	        actions_1.Actions.connect(this, `content-script-${this.uid}`);
	        return true;
	    }
	    notifyDisconnect() {
	        if (!this.port)
	            return;
	        actions_1.Actions.postpone(this, 'clear');
	    }
	    process(action, data) {
	        this.touched = +new Date;
	        switch (action) {
	            case actions_1.Actions.FETCH: {
	                this.fetch(data.uri, (data, error) => {
	                    actions_1.Actions.data(this, data, error);
	                });
	                break;
	            }
	            case actions_1.Actions.PICK: {
	                this.pick(data.pool, (data, error) => {
	                    if (!error)
	                        window.open(`https://toloka.yandex.ru/task/${data.poolId}/${data.id}`, '_blank');
	                    else
	                        alert(`Task accept error:\n${JSON.stringify(error)}`);
	                });
	                break;
	            }
	        }
	    }
	    fetch(uri, callback) {
	        jQuery.ajax({
	            url: this.resolve(uri),
	            type: 'GET',
	            crossDomain: true,
	            success: callback,
	            error: function (e) {
	                callback(false, e);
	            },
	            beforeSend: function (xhr) {
	                xhr.setRequestHeader('Content-Type', "application/json; charset=UTF-8");
	                xhr.setRequestHeader('Access-Control-Allow-Origin', "*");
	            }
	        });
	    }
	    pick(pool, callback) {
	        jQuery.ajax({
	            url: this.resolve(`assignments`),
	            headers: {
	                'Access-Control-Allow-Origin': '*',
	                'X-CSRF-Token': Cookies.get('toloka-csrftoken'),
	            },
	            crossDomain: true,
	            contentType: "application/json; charset=utf-8",
	            type: 'POST',
	            data: JSON.stringify({
	                poolId: pool,
	            }),
	            success: (data) => {
	                if (data.id)
	                    callback(data);
	                else
	                    callback(false, data.msg);
	            },
	            error: function (e) {
	                callback(false, e);
	            },
	        });
	    }
	}
	((channel, interval) => {
	    window.onbeforeunload = function (e) {
	        return channel.notifyDisconnect();
	    };
	    let checker = () => {
	        let prev = channel.touched;
	        let delta = ((+new Date) - prev);
	        if (delta > interval) {
	            if (prev)
	                console.log(`Last request ${delta} msec ago (${interval} delay for reconnect)`);
	            if (!channel.requestConnect()) {
	                console.log('Failed to connect to extension, reloading');
	                window.location.reload();
	            }
	        }
	    };
	    window.setInterval(checker, interval / 10);
	    checker();
	})(new TolokaChannel(), 60 * 1000);
	//# sourceMappingURL=content.js.map

/***/ },

/***/ 2:
/***/ function(module, exports) {

	"use strict";
	class Port {
	    constructor(name) {
	        this.name = Port.portName(name);
	    }
	    bind(port) {
	    }
	    static portName(port) {
	        return `${port}-data-channel`;
	    }
	}
	exports.Port = Port;
	class ClientPort extends Port {
	    constructor(name, port) {
	        super(name);
	        this.uid = Math.random();
	        this.rebind(port);
	    }
	    disconnect() {
	        if (this.port)
	            this.port.disconnect();
	    }
	    rebind(port) {
	        return this.bind(port || chrome.runtime.connect({ name: this.name }));
	    }
	    bind(port) {
	        if (!port)
	            return;
	        port.onMessage.addListener((msg) => {
	            this.process(msg.action, msg.data, msg.uid);
	        });
	        port.onDisconnect.addListener(() => {
	            this.port = null;
	        });
	        return this.port = port;
	    }
	    send(action, data) {
	        if (this.port)
	            this.port.postMessage({ uid: this.uid, action: action, data: data });
	    }
	}
	exports.ClientPort = ClientPort;
	class ServerPort extends Port {
	    constructor(name) {
	        super(name);
	        chrome.runtime.onConnect.addListener((port) => {
	            if (port.name === this.name) {
	                let client = this.connect(port);
	                if (client)
	                    port.onDisconnect.addListener((port) => {
	                        this.disconnect(client);
	                    });
	            }
	        });
	    }
	    send(action, data) {
	        throw new Error('Messages can be send only to specific clients');
	    }
	}
	exports.ServerPort = ServerPort;
	//# sourceMappingURL=port.js.map

/***/ },

/***/ 3:
/***/ function(module, exports) {

	"use strict";
	class Actions {
	    static connect(port, data) {
	        return port.send(Actions.CONNECT, data);
	    }
	    static postpone(port, what) {
	        return port.send(Actions.POSTPONE, what);
	    }
	    static fetch(port, uri) {
	        return port.send(Actions.FETCH, { uri: uri });
	    }
	    static data(port, data, error) {
	        return port.send(Actions.DATA, { data: data, error: error });
	    }
	    static tasks(port, data) {
	        return port.send(Actions.TASKS, data);
	    }
	    static ping(port) {
	        return port.send(Actions.PING);
	    }
	    static pick(port, pool) {
	        return port.send(Actions.PICK, { pool: pool });
	    }
	}
	Actions.CONNECT = 'connect';
	Actions.POSTPONE = 'postpone';
	Actions.FETCH = 'fetch';
	Actions.DATA = 'data';
	Actions.TASKS = 'tasks';
	Actions.PICK = 'pick';
	Actions.PING = 'ping';
	exports.Actions = Actions;
	//# sourceMappingURL=actions.js.map

/***/ },

/***/ 13:
/***/ function(module, exports) {

	module.exports = jQuery;

/***/ }

/******/ });
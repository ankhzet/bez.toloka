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
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const server_1 = __webpack_require__(1);
	chrome.runtime.onInstalled.addListener(details => {
	    console.log('previousVersion', details.previousVersion);
	});
	let toloka = new server_1.Toloka();
	//# sourceMappingURL=background.js.map

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const port_1 = __webpack_require__(2);
	const actions_1 = __webpack_require__(3);
	const matchers_1 = __webpack_require__(4);
	const items_storage_1 = __webpack_require__(5);
	const intervable_1 = __webpack_require__(6);
	const badge_1 = __webpack_require__(7);
	const task_wrapper_1 = __webpack_require__(8);
	const extension_config_1 = __webpack_require__(9);
	const notificator_1 = __webpack_require__(11);
	class Client extends port_1.ClientPort {
	    constructor(delegate, port) {
	        super('toloka', port);
	        this.delegate = delegate;
	    }
	    process(action, msg, uid) {
	        if (action === actions_1.Actions.CONNECT)
	            this.uid = uid;
	        this.delegate.process(this, action, msg, uid);
	    }
	}
	exports.Client = Client;
	class Server extends port_1.ServerPort {
	    constructor() {
	        super('toloka');
	        this.badge = new badge_1.StateBadge();
	        this.leechers = [];
	        this.feeders = [];
	        this.clients = {};
	        this.postponed = [];
	        this.intervable = new intervable_1.Intervable();
	        this.tasks = new TasksStorage((uid, a, d) => this.updated(uid, a, d));
	        this.includes = new matchers_1.Matchers([
	            new matchers_1.AvailabilityMatcher(),
	            new matchers_1.TitleMatcher([
	                'Определение скриншотов документов с контентом для взрослых',
	                'Идентификация запросов для взрослых',
	                'Самые красивые картинки',
	                'Уместность видео',
	                // 'Закрывающая реклама',
	                'Очистка списка картинок',
	                'Рекомендации к видео',
	                'Качество картинок',
	            ]),
	        ]);
	        this.status(`*`, badge_1.StateBadge.IDDLE);
	        this.intervable.watch(actions_1.Actions.PING, 10 * 1000, () => this.broadcastPing());
	        this.intervable.watch(actions_1.Actions.FETCH, 30 * 1000, () => this.broadcastFetch());
	    }
	    connect(port) {
	        return new Client(this, port);
	    }
	    clearAfterDisconnect(client) {
	        let uid = client.uid;
	        let pools = ['leechers', 'feeders'];
	        let feeder = this.leechers.indexOf(client) < 0;
	        let pool = pools[feeder ? 1 : 0];
	        let filtered = this[pool].filter((port) => uid === port.uid);
	        if (feeder) {
	            this.tasks.update(uid, []);
	            if (!filtered.length)
	                this.status(`-`, badge_1.StateBadge.IDDLE);
	        }
	        this[pool] = filtered;
	        delete this.clients[uid];
	    }
	    disconnect(port) {
	        if (this.isPostponed(port))
	            setTimeout(() => {
	                if (!this.isPostponed(port))
	                    return;
	                this.setIsPostponed(port, false);
	                this.clearAfterDisconnect(port);
	            }, 5000);
	        else
	            this.clearAfterDisconnect(port);
	    }
	    isPostponed(port) {
	        return this.postponed.indexOf(port.uid) >= 0;
	    }
	    setIsPostponed(port, postponed = true) {
	        let without = this.postponed
	            .filter((postponed) => postponed != port.uid);
	        if (postponed)
	            without.push(port.uid);
	        this.postponed = without;
	    }
	    postponeClear(client) {
	        this.setIsPostponed(client);
	    }
	    process(client, action, msg, uid) {
	        switch (action) {
	            case actions_1.Actions.CONNECT: {
	                this.clients[client.uid] = client;
	                let feeder = msg.match(/content-script-([\d\.]+)/);
	                if (feeder) {
	                    this.setIsPostponed(client, false);
	                    this.feeders.push(client);
	                    this.intervable.reset(actions_1.Actions.FETCH);
	                }
	                else
	                    this.leechers.push(client);
	                break;
	            }
	            case actions_1.Actions.POSTPONE: {
	                switch (msg) {
	                    case 'clear':
	                        this.postponeClear(client);
	                        break;
	                }
	                break;
	            }
	            case actions_1.Actions.DATA: {
	                let { data = undefined, error = false } = msg || {};
	                if (data)
	                    this.tasks.update(client.uid, data);
	                else
	                    this.error(client, error);
	                break;
	            }
	            case actions_1.Actions.TASKS: {
	                this.notify(client);
	                break;
	            }
	        }
	    }
	    error(client, error) {
	        this.badge.state(badge_1.StateBadge.FAILURE);
	        chrome.browserAction.setTitle({ title: `${error}` });
	        console.log('Error:', error);
	    }
	    updated(uid, added, gone) {
	        this.broadcastNotify();
	        let all = this.tasks.all();
	        let filtered = this.includes.match(all);
	        let has = filtered.length;
	        if (has) {
	            this.status(`${has}`);
	        }
	        else
	            this.status(`-`);
	        return filtered;
	    }
	    client(uid) {
	        return this.clients[uid];
	    }
	    status(text, state = badge_1.StateBadge.ACTIVE) {
	        this.badge.state(state);
	        this.badge.text = text;
	    }
	    notify(leecher, tasks) {
	        return actions_1.Actions.tasks(leecher, tasks || this.tasks.all());
	    }
	    pick(feeder, id) {
	        return actions_1.Actions.pick(feeder, id);
	    }
	    fetch(feeder, flashStatus = true) {
	        if (flashStatus)
	            this.badge.state(badge_1.StateBadge.WORKING);
	        return actions_1.Actions.fetch(feeder, 'task-suite-pools');
	    }
	    ping(feeder) {
	        return actions_1.Actions.ping(feeder);
	    }
	    broadcastPing() {
	        for (let client of this.feeders)
	            this.ping(client);
	    }
	    broadcastFetch() {
	        this.badge.state(badge_1.StateBadge.WORKING);
	        for (let client of this.feeders)
	            this.fetch(client, false);
	    }
	    broadcastNotify() {
	        let tasks = this.tasks.all();
	        for (let client of this.leechers)
	            this.notify(client, tasks);
	    }
	}
	class TasksStorage extends items_storage_1.ItemsStorage {
	    resolveId(item) {
	        return item.tec.poolId;
	    }
	}
	class Toloka extends Server {
	    constructor() {
	        super();
	        this.showFor = 15000;
	        this.config = new extension_config_1.ExtensionConfig();
	        this.config.buzzerSound = 'sounds/alarm-buzzer.ogg';
	        this.config.buzzerVolume = 1.0;
	        this.notification = new notificator_1.Notificator('toloka-fresh-tasks', this.config);
	    }
	    updated(uid, added, gone) {
	        let filtered = super.updated(uid, added, gone);
	        let fresh = filtered
	            .filter((task) => added.indexOf(task.tec.poolId) >= 0)
	            .map((item) => new task_wrapper_1.TaskWrapper(item));
	        if (fresh.length)
	            this.notifyFreshTasks(this.client(uid), fresh);
	        return filtered;
	    }
	    notifyFreshTasks(feeder, tasks) {
	        this.notification.show({
	            options: {
	                type: 'list',
	                title: 'New task!',
	                message: `There are ${tasks.length} fresh pols`,
	                items: tasks.map((pol) => {
	                    return { title: pol.title, message: pol.requester };
	                }),
	                buttons: tasks.length == 1
	                    ? [{ title: 'Start' }]
	                    : [{ title: 'Start topmost' }, { title: 'Pick' }],
	            },
	            click: (button) => {
	                switch (button) {
	                    case 0: {
	                        this.pick(feeder, tasks[0].uid);
	                        break;
	                    }
	                    case 1: {
	                        window.open('popup.html', '_blank');
	                        break;
	                    }
	                }
	            },
	        }, this.showFor);
	    }
	}
	exports.Toloka = Toloka;
	//# sourceMappingURL=server.js.map

/***/ },
/* 2 */
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
/* 3 */
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
/* 4 */
/***/ function(module, exports) {

	"use strict";
	class Matcher {
	    constructor(probe) {
	        this.probe = probe;
	    }
	    match(item) {
	        for (let property in item) {
	            let method = this[property];
	            if (method)
	                if (method.call(this, item[property]))
	                    return property;
	        }
	    }
	}
	exports.Matcher = Matcher;
	class Matchers {
	    constructor(matchers) {
	        this.matchers = matchers;
	    }
	    match(items) {
	        let result = [];
	        for (let item of items) {
	            for (let matcher of this.matchers)
	                if (matcher.match(item)) {
	                    result.push(item);
	                    break;
	                }
	        }
	        return result;
	    }
	}
	exports.Matchers = Matchers;
	class DetailsMatcher extends Matcher {
	    tec(value) {
	        return this.match(value);
	    }
	}
	exports.DetailsMatcher = DetailsMatcher;
	class TitleMatcher extends DetailsMatcher {
	    regexes() {
	        if (this._regexes)
	            return this._regexes;
	        let result = [];
	        for (let pattern of this.probe)
	            result.push(new RegExp(`^.*${pattern.replace('*', '.*')}.*$`));
	        return this._regexes = result;
	    }
	    title(value) {
	        return this.regexes().filter((regexp) => value.match(regexp)).length > 0;
	    }
	}
	exports.TitleMatcher = TitleMatcher;
	class AvailabilityMatcher extends Matcher {
	    mobile() {
	        return false;
	    }
	    availability(value) {
	        return this.probe === (value || '').match(this.mobile()
	            ? /^AVAILABLE_ON_MOBILE$/i
	            : /^AVAILABLE$/i);
	    }
	}
	exports.AvailabilityMatcher = AvailabilityMatcher;
	//# sourceMappingURL=matchers.js.map

/***/ },
/* 5 */
/***/ function(module, exports) {

	"use strict";
	class ItemsStorage {
	    constructor(handler) {
	        this.storage = {};
	        this.handler = handler;
	    }
	    put(uid, queue) {
	        this.raw = undefined;
	        this.arr = undefined;
	        return this.storage[uid] = queue;
	    }
	    update(uid, queue) {
	        if (!this.handler)
	            return this.put(uid, queue);
	        let ao = this.queue();
	        this.put(uid, queue);
	        let an = this.queue();
	        let o = Object.keys(ao);
	        let n = Object.keys(an);
	        // console.log('updated:', o, n, ao, an, this);
	        let add = n.filter((id) => o.indexOf(id) < 0).map(parseFloat);
	        let del = o.filter((id) => n.indexOf(id) < 0).map(parseFloat);
	        // console.log(`update[${uid}]: ${queue.length}, added ${add.length}, gone ${del.length}`);
	        return this.handler(uid, add, del);
	    }
	    queue() {
	        if (!this.raw) {
	            let all = {};
	            for (let uid in this.storage)
	                for (let item of this.storage[uid])
	                    all[this.resolveId(item)] = item;
	            this.raw = all;
	        }
	        return this.raw;
	    }
	    all() {
	        if (!this.arr) {
	            let queue = this.queue();
	            let result = [];
	            for (let id in queue)
	                result.push(queue[id]);
	            this.arr = result;
	        }
	        return this.arr;
	    }
	    get(ids) {
	        let queue = this.queue();
	        let result = [];
	        for (let id of ids)
	            result.push(queue[id]);
	        return result;
	    }
	}
	exports.ItemsStorage = ItemsStorage;
	//# sourceMappingURL=items-storage.js.map

/***/ },
/* 6 */
/***/ function(module, exports) {

	"use strict";
	class Intervable {
	    constructor() {
	        this.intervals = {};
	        this.touched = {};
	        this.handlers = {};
	        this.start();
	    }
	    watch(tap, interval, callback) {
	        let old = this.interval;
	        this._interval = 0;
	        this.intervals[tap] = interval;
	        this.handlers[tap] = callback;
	        this.reset(tap);
	        // restart if common intarval changed
	        if (old !== this.interval)
	            this.start();
	    }
	    touch(tap, timestamp = +new Date) {
	        this.touched[tap] = timestamp;
	    }
	    reset(taps) {
	        if (!taps)
	            taps = Object.keys(this.intervals);
	        else if (!(taps instanceof Array))
	            taps = [taps];
	        for (let tap of taps)
	            this.touch(tap, 0);
	    }
	    start() {
	        if (this.timer)
	            this.stop();
	        this.timer = setInterval(() => {
	            let now = +new Date;
	            for (let action in this.intervals) {
	                let old = this.touched[action];
	                if (!old)
	                    old = 0;
	                if ((now - old) > this.intervals[action]) {
	                    this.handlers[action]();
	                    this.touch(action);
	                }
	            }
	        }, this.interval);
	    }
	    stop() {
	        clearInterval(this.timer);
	        this.timer = 0;
	    }
	    get interval() {
	        if (this._interval)
	            return this._interval;
	        let intervals = [];
	        for (let tap in this.intervals)
	            intervals.push(this.intervals[tap]);
	        return this._interval = Util.denom(intervals, 1000) / 5;
	    }
	    set interval(value) {
	        this._interval = value;
	    }
	}
	exports.Intervable = Intervable;
	class Util {
	    static nod(a, b) {
	        while (a !== b)
	            if (a > b)
	                a -= b;
	            else
	                b -= a;
	        return a;
	    }
	    static denom(set, min) {
	        set = set.map((n) => n);
	        while (set.length > 1) {
	            set.sort((a, b) => b - a);
	            set[0] = this.nod(set[0], set[set.length - 1]);
	            set = set.filter((n, i) => set.indexOf(n) === i);
	        }
	        return min
	            ? Math.max(set[0], min)
	            : set[0];
	    }
	}
	//# sourceMappingURL=intervable.js.map

/***/ },
/* 7 */
/***/ function(module, exports) {

	"use strict";
	class Badge {
	    set text(value) {
	        chrome.browserAction.setBadgeText({ text: value });
	    }
	    set background(value) {
	        chrome.browserAction.setBadgeBackgroundColor({ color: value });
	    }
	    hide() {
	        this.text = '';
	    }
	}
	exports.Badge = Badge;
	class StateBadge extends Badge {
	    constructor(...args) {
	        super(...args);
	        this.COLORS = ['#888', '#555', '#00f', '#0f0', '#f00'];
	    }
	    state(state = 1) {
	        this.background = this.COLORS[state];
	    }
	    hide() {
	        this.state(StateBadge.IDDLE);
	        super.hide();
	    }
	}
	StateBadge.IDDLE = 1;
	StateBadge.WORKING = 2;
	StateBadge.ACTIVE = 3;
	StateBadge.FAILURE = 4;
	exports.StateBadge = StateBadge;
	//# sourceMappingURL=badge.js.map

/***/ },
/* 8 */
/***/ function(module, exports) {

	"use strict";
	class TaskWrapper {
	    constructor(data) {
	        this.data = data;
	    }
	    get uid() {
	        return this.data.tec.poolId;
	    }
	    get title() {
	        return this.data.tec.title;
	    }
	    get description() {
	        return this.data.tec.description;
	    }
	    get requester() {
	        return this.data.tec.requesterInfo.name.RU;
	    }
	}
	exports.TaskWrapper = TaskWrapper;
	//# sourceMappingURL=task-wrapper.js.map

/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const config_1 = __webpack_require__(10);
	class ExtensionConfig extends config_1.Config {
	    get buzzerSound() {
	        return this.get(ExtensionConfig.BUZZER_SOUND);
	    }
	    set buzzerSound(path) {
	        this.set(ExtensionConfig.BUZZER_SOUND, path);
	    }
	    get buzzerVolume() {
	        return this.get(ExtensionConfig.BUZZER_VOLUME);
	    }
	    set buzzerVolume(value) {
	        this.set(ExtensionConfig.BUZZER_VOLUME, value);
	    }
	}
	ExtensionConfig.BUZZER_SOUND = 'buzzer-sound';
	ExtensionConfig.BUZZER_VOLUME = 'buzzer-volume';
	exports.ExtensionConfig = ExtensionConfig;
	//# sourceMappingURL=extension-config.js.map

/***/ },
/* 10 */
/***/ function(module, exports) {

	"use strict";
	class Config {
	    get(path) {
	        return JSON.parse(localStorage.getItem(path));
	    }
	    set(path, value) {
	        localStorage.setItem(path, JSON.stringify(value));
	    }
	}
	exports.Config = Config;
	//# sourceMappingURL=config.js.map

/***/ },
/* 11 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	const buzzer_1 = __webpack_require__(12);
	class Notificator {
	    constructor(notification, config) {
	        this.notification = notification;
	        this.buzzer = new buzzer_1.Buzzer(config.buzzerSound, config.buzzerVolume);
	    }
	    show({ options, click }, clear = 5000) {
	        let base = {
	            type: 'basic',
	            iconUrl: 'images/icon-128.png',
	        };
	        for (let prop in options)
	            base[prop] = options[prop];
	        chrome.notifications.create(this.notification, base, () => {
	            if (click) {
	                let listener = (id, button) => {
	                    chrome.notifications.onButtonClicked.removeListener(listener);
	                    click(button);
	                };
	                chrome.notifications.onButtonClicked.addListener(listener);
	            }
	            setTimeout(() => this.hide(), clear);
	            this.buzzer.buzz();
	        });
	        chrome.notifications.onClosed.addListener(() => {
	            this.buzzer.stop();
	        });
	    }
	    hide() {
	        chrome.notifications.clear(this.notification);
	    }
	}
	exports.Notificator = Notificator;
	//# sourceMappingURL=notificator.js.map

/***/ },
/* 12 */
/***/ function(module, exports) {

	"use strict";
	class Buzzer {
	    constructor(sound, volume = 1.0) {
	        this.sound = sound;
	        this.volume = volume;
	    }
	    set sound(value) {
	        this._sound = value;
	        if (!this._audio)
	            return;
	        let play = !this.audio.paused;
	        this.audio.pause();
	        this._audio = null;
	        if (play)
	            this.buzz();
	    }
	    set volume(value) {
	        this._volume = value;
	        if (this.audio)
	            this.audio.volume = value;
	    }
	    get audio() {
	        if (!this._audio) {
	            this._audio = new Audio(this._sound);
	            if (this._volume !== undefined)
	                this._audio.volume = this._volume;
	        }
	        return this._audio;
	    }
	    buzz() {
	        this.audio.play();
	    }
	    stop() {
	        this.audio.pause();
	    }
	}
	exports.Buzzer = Buzzer;
	//# sourceMappingURL=buzzer.js.map

/***/ }
/******/ ]);
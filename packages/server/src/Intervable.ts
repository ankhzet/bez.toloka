import { Util } from '@beztoloka/domains';

export class Intervable {
    private readonly intervals: Record<string, number>;
    private readonly touched: Record<string, number>;
    private readonly handlers: Record<string, () => void>;
    private timer?: number;
    private _interval?: number;

    constructor() {
        this.intervals = {};
        this.touched = {};
        this.handlers = {};

        this.start();
    }

    watch(tap: string, interval: number, callback: () => void) {
        const old = this.interval;
        this._interval = 0;
        this.intervals[tap] = interval;
        this.handlers[tap] = callback;

        this.reset(tap);

        // restart if common interval changed
        if (old !== this.interval) {
            this.start();
        }
    }

    touch(tap: string, timestamp: number = +new Date()) {
        this.touched[tap] = timestamp;
    }

    reset(taps: string[] | string) {
        if (!taps) {
            taps = Object.keys(this.intervals);
        } else if (!(taps instanceof Array)) {
            taps = [taps];
        }

        for (const tap of taps) {
            this.touch(tap, 0);
        }
    }

    start() {
        if (this.timer) {
            this.stop();
        }

        this.timer = setInterval(
            (() => {
                const now = +new Date();

                for (const [action, interval] of Object.entries(this.intervals)) {
                    const old = this.touched[action] || 0;

                    if (now - old > interval) {
                        this.handlers[action]();

                        this.touch(action);
                    }
                }
            }) as TimerHandler,
            this.interval
        );
    }

    stop() {
        clearInterval(this.timer);
        this.timer = 0;
    }

    get interval() {
        if (this._interval) {
            return this._interval;
        }

        const intervals = [];

        for (const tap in this.intervals) {
            intervals.push(this.intervals[tap]);
        }

        return (this._interval = Util.denom(intervals, 1000) / 5);
    }

    set interval(value: number) {
        this._interval = value;
    }
}

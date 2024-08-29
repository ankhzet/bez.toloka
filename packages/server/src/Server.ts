import { Actions, ServerPort } from '@beztoloka/domains';
import { StateBadge } from '@beztoloka/ui';

import { Client } from './Client';
import { Intervable } from './Intervable';
import { TasksStorage } from './TasksStorage';
import { AvailabilityMatcher, Matchers, TitleMatcher } from './Matcher';

export class Server extends ServerPort<any> {
    private readonly clients: Record<string, Client>;
    private readonly badge: StateBadge;
    protected leechers: Client[];
    protected feeders: Client[];
    private postponed: string[];
    private intervable: Intervable;
    private tasks: TasksStorage;
    private includes: Matchers<any>;

    constructor() {
        super('toloka');
        this.badge = new StateBadge();
        this.leechers = [];
        this.feeders = [];
        this.clients = {};
        this.postponed = [];
        this.intervable = new Intervable();
        this.tasks = new TasksStorage((uid, a, d) => this.updated(uid, a, d));
        this.includes = new Matchers([
            new AvailabilityMatcher(),
            new TitleMatcher([
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
        this.status(`*`, StateBadge.IDLE);
        this.intervable.watch(Actions.PING, 10 * 1000, () => this.broadcastPing());
        this.intervable.watch(Actions.FETCH, 30 * 1000, () => this.broadcastFetch());
    }

    connect(port: chrome.runtime.Port): Client {
        return new Client(this, port);
    }

    clearAfterDisconnect(client: Client) {
        const uid = client.uid;
        const feeder = this.leechers.indexOf(client) < 0;
        const pool = feeder ? 'feeders' : 'leechers';
        const filtered = this[pool].filter((port) => uid === port.uid);

        if (feeder) {
            this.tasks.update(uid, []);

            if (!filtered.length) {
                this.status(`-`, StateBadge.IDLE);
            }
        }

        this[pool] = filtered;
        delete this.clients[uid];
    }

    disconnect(client: Client) {
        if (this.isPostponed(client)) {
            setTimeout(() => {
                if (!this.isPostponed(client)) {
                    return;
                }

                this.setIsPostponed(client, false);
                this.clearAfterDisconnect(client);
            }, 5000);
        } else {
            this.clearAfterDisconnect(client);
        }
    }

    isPostponed(client: Client) {
        return this.postponed.indexOf(client.uid) >= 0;
    }

    setIsPostponed(client: Client, postponed = true) {
        const without = this.postponed.filter((postponed) => postponed != client.uid);

        if (postponed) {
            without.push(client.uid);
        }

        this.postponed = without;
    }

    postponeClear(client: Client) {
        this.setIsPostponed(client);
    }

    process(client: Client, action: string, msg: any) {
        switch (action) {
            case Actions.CONNECT: {
                this.clients[client.uid] = client;
                const feeder = (msg || '').match(/content-script-([\d.]+)/);

                if (feeder) {
                    this.setIsPostponed(client, false);
                    this.feeders.push(client);
                    this.intervable.reset(Actions.FETCH);
                } else {
                    this.leechers.push(client);
                }

                break;
            }

            case Actions.POSTPONE: {
                switch (msg) {
                    case 'clear':
                        this.postponeClear(client);
                        break;
                }
                break;
            }

            case Actions.DATA: {
                const { data = undefined, error = false } = msg || {};

                if (data) {
                    this.tasks.update(client.uid, data);
                } else {
                    this.error(client, error);
                }

                break;
            }

            case Actions.TASKS: {
                this.notifyTasks(client);
                break;
            }
        }
    }

    error(client: Client, error: string | Error) {
        this.badge.state(StateBadge.FAILURE);
        void chrome.browserAction.setTitle({ title: `${error}` });

        console.log('Error:', error);
    }

    updated(uid: string, added: number[], gone: number[]) {
        this.broadcastNotify();

        const all = this.tasks.all();
        const filtered = this.includes.match(all);
        const has = filtered.length;

        this.status(has ? `${has}` : '-');

        return filtered;
    }

    client(uid: string): Client {
        return this.clients[uid]!;
    }

    status(text: string, state = StateBadge.ACTIVE) {
        this.badge.state(state);
        this.badge.text = text;
    }

    notifyTasks(leecher: Client, tasks?: any[]) {
        return Actions.tasks(leecher, tasks || this.tasks.all());
    }

    pick(feeder: Client, poolId: string) {
        return Actions.pick(feeder, poolId);
    }

    fetch(feeder: Client, flashStatus = true) {
        if (flashStatus) {
            this.badge.state(StateBadge.WORKING);
        }

        return Actions.fetch(feeder, 'task-suite-pools');
    }

    ping(feeder: Client) {
        return Actions.ping(feeder);
    }

    broadcastPing() {
        for (const client of this.feeders) {
            this.ping(client);
        }
    }

    broadcastFetch() {
        this.badge.state(StateBadge.WORKING);

        for (const client of this.feeders) {
            this.fetch(client, false);
        }
    }

    broadcastNotify() {
        const tasks = this.tasks.all();

        for (const client of this.leechers) {
            this.notifyTasks(client, tasks);
        }
    }
}

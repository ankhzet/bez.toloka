import { ExtensionConfig, TaskWrapper } from '@beztoloka/domains';
import { Notificator } from '@beztoloka/ui';

import { Server } from './Server';
import { Client } from './Client';

export class Toloka extends Server {
    private readonly showFor: number;
    private readonly config: ExtensionConfig;
    private readonly notification: Notificator;

    constructor() {
        super();
        this.showFor = 15000;
        this.config = new ExtensionConfig();
        this.config.buzzerSound = 'sounds/alarm-buzzer.ogg';
        this.config.buzzerVolume = 1.0;
        this.notification = new Notificator('toloka-fresh-tasks', this.config);
    }

    updated(uid: string, added: number[], gone: number[]) {
        const filtered = super.updated(uid, added, gone);
        const fresh = filtered
            .filter((task) => added.indexOf(task.tec.poolId) >= 0)
            .map((item) => new TaskWrapper(item));

        if (fresh.length) {
            this.notifyFreshTasks(this.client(uid), fresh);
        }

        return filtered;
    }

    notifyFreshTasks(feeder: Client, tasks: TaskWrapper[]) {
        this.notification.show(
            {
                options: {
                    type: 'list',
                    title: 'New task!',
                    message: `Got ${tasks.length} fresh task(s)`,
                    items: tasks.map((pool) => {
                        return { title: pool.title, message: pool.requester };
                    }),
                    buttons: tasks.length == 1 ? [{ title: 'Start' }] : [{ title: 'Start topmost' }, { title: 'Pick' }],
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
            },
            this.showFor,
        );
    }
}

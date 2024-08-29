import { Actions, ClientPort, TaskData, TaskWrapper } from '@beztoloka/domains';

export class TaskFetcher extends ClientPort {
    private readonly listeners: ((tasks: TaskWrapper[]) => void)[];

    constructor(callback: (tasks: TaskWrapper[]) => void) {
        super('toloka');
        this.listeners = [];
        this.listeners.push(callback);
    }

    requestConnect(): void {
        Actions.connect(this);
    }

    process(action: string, data: unknown): void {
        if (action === Actions.TASKS) {
            if (!this.listeners.length) {
                return;
            }

            const wrapped: TaskWrapper[] = [];

            for (const item of data as TaskData[]) {
                wrapped.push(new TaskWrapper(item));
            }

            for (const listener of this.listeners) {
                listener(wrapped);
            }
        }
    }

    fetch(): void {
        Actions.tasks(this);
    }
}

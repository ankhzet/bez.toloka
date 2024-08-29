type StorageUpdateHandler<T> = (uid: string, add: number[], del: number[]) => T[];

export abstract class ItemsStorage<T> {
    private readonly storage: Record<string, T[]>;
    private readonly handler: StorageUpdateHandler<T> | undefined;

    private raw?: Record<string, T>;
    private arr?: T[];

    constructor(handler?: StorageUpdateHandler<T>) {
        this.storage = {};
        this.handler = handler;
    }

    abstract resolveId(item: T): string;

    put(uid: string, queue: T[]): T[] {
        this.raw = undefined;
        this.arr = undefined;

        return (this.storage[uid] = queue);
    }

    update(uid: string, queue: T[]): T[] {
        if (!this.handler) {
            return this.put(uid, queue);
        }

        const ao = this.queue();
        this.put(uid, queue);
        const an = this.queue();
        const o = Object.keys(ao);
        const n = Object.keys(an);
        // console.log('updated:', o, n, ao, an, this);
        const add = n.filter((id) => o.indexOf(id) < 0).map(parseFloat);
        const del = o.filter((id) => n.indexOf(id) < 0).map(parseFloat);
        // console.log(`update[${uid}]: ${queue.length}, added ${add.length}, gone ${del.length}`);

        return this.handler(uid, add, del);
    }

    queue(): Record<string, T> {
        if (!this.raw) {
            const all: Record<string, T> = {};

            for (const queue of Object.values(this.storage)) {
                for (const item of queue) {
                    all[this.resolveId(item)] = item;
                }
            }

            this.raw = all;
        }

        return this.raw;
    }

    all(): T[] {
        if (!this.arr) {
            const queue = this.queue();
            const result: T[] = [];

            for (const item of Object.values(queue)) {
                result.push(item);
            }

            this.arr = result;
        }

        return this.arr;
    }

    get(ids: string[]): T[] {
        const queue = this.queue();
        const result: T[] = [];

        for (const id of ids) {
            result.push(queue[id]);
        }

        return result;
    }
}

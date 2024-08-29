import { Port } from './Port';
import { TaskData } from './TaskData';

type Postponable = 'clear';

export class Actions {
    static CONNECT = 'connect';
    static POSTPONE = 'postpone';
    static FETCH = 'fetch';
    static DATA = 'data';
    static TASKS = 'tasks';
    static PICK = 'pick';
    static PING = 'ping';

    static connect(port: Port, name?: string): void {
        return port.send(this.CONNECT, name);
    }
    static postpone(port: Port, what: Postponable): void {
        return port.send(this.POSTPONE, what);
    }
    static fetch(port: Port, uri: string): void {
        return port.send(this.FETCH, { uri });
    }
    static data<T>(port: Port, data: T, error?: string | false): void {
        return port.send(this.DATA, { data, error });
    }
    static tasks(port: Port, tasks?: TaskData[]): void {
        return port.send(this.TASKS, tasks);
    }
    static ping(port: Port): void {
        return port.send(this.PING);
    }
    static pick(port: Port, poolId: string): void {
        return port.send(this.PICK, { poolId });
    }
}

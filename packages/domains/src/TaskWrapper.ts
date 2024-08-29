import { TaskData } from './TaskData';

export class TaskWrapper {
    private readonly data: TaskData;

    constructor(data: TaskData) {
        this.data = data;
    }

    get uid(): string {
        return this.data.tec.poolId;
    }

    get title(): string {
        return this.data.tec.title;
    }

    get description(): string {
        return this.data.tec.description;
    }

    get requester(): string {
        return this.data.tec.requesterInfo.name.RU;
    }
}

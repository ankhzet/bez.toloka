import { TaskData } from '@beztoloka/domains';
import { ItemsStorage } from './ItemStorage';

export class TasksStorage extends ItemsStorage<TaskData> {
    resolveId(item: TaskData) {
        return item.tec.poolId;
    }
}

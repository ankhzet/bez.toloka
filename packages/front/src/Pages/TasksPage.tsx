import React, { useMemo, useState, VFC } from 'react';
import { useAsyncFn, useMount, useUnmount } from 'react-use';
import { Card } from 'react-bootstrap';

import { RequesterInfoData, TaskWrapper } from '@beztoloka/domains';
import { TaskFetcher } from '../TaskFetcher';

const TaskItem = ({ task }: { task: TaskWrapper }) => (
    <div className="task">
        <span className="title">{task.title}</span>
        <span className="requester">{task.requester}</span>
    </div>
);

const TasksList = ({ tasks, error }: { tasks: TaskWrapper[]; error?: string }) => (
    <div>
        <ul>
            <li>
                {tasks.map((task) => (
                    <TaskItem key={task.uid} task={task} />
                ))}
            </li>
        </ul>
        {error && <div className="error">{error}</div>}
    </div>
);

export const TasksPage: VFC = () => {
    const [tasks, setTasks] = useState<TaskWrapper[]>([]);
    const fetcher = useMemo(
        () => ({
            requestConnect() {},
            fetch() {
                const r1 = { id: 'r1', name: { RU: 'Ya.Yaya' } };
                const r2 = { id: 'r2', name: { RU: 'Ya.Nono' } };
                const data = [
                    { tec: { poolId: 'a', title: 'Task a', description: 'lorem ipsum dolor', requesterInfo: r1 } },
                    { tec: { poolId: 'b', title: 'Task b', description: 'lorem ipsum dolor', requesterInfo: r2 } },
                ];
                setTasks(data.map((i) => new TaskWrapper(i)));
            },
            disconnect() {},
        }),
        // new TaskFetcher((tasks) => {
        //     if (tasks) {
        //         setTasks(tasks);
        //     }
        // }),
        [],
    );

    const [, run] = useAsyncFn(async () => {
        fetcher.requestConnect();
        fetcher.fetch();
    });

    useMount(() => {
        void run();
    });

    useUnmount(() => {
        fetcher.disconnect();
    });

    return (
        <Card>
            <TasksList tasks={tasks} />
        </Card>
    );
};

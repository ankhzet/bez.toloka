export interface TaskData {
    tec: {
        poolId: string;
        title: string;
        description: string;
        requesterInfo: RequesterInfoData;
    };
}

export interface RequesterInfoData {
    id: string;
    name: {
        RU: string;
    };
}

import { Actions, ClientPort } from '@beztoloka/domains';

type DataCallback<T> = (error: false | string, data?: T) => void;
type PoolResponse = { poolId: string; id: string };
type ErrorResponse = { msg: string };
type PoolApiResponse = PoolResponse | ErrorResponse;

const isValidResponse = (r: PoolApiResponse): r is PoolResponse => !!(r as any).id;

const jQuery: any = {};
const Cookies: any = {};

export class TolokaChannel extends ClientPort {
    public touched: number;

    constructor() {
        super('toloka');
        this.touched = 0;

        const uid = JSON.parse(sessionStorage.getItem('beztoloka-channel') || '""');

        if (uid) {
            this.uid = uid;
        } else {
            sessionStorage.setItem('beztoloka-channel', JSON.stringify(this.uid));
        }
    }

    resolve(uri: string): string {
        return `https://toloka.yandex.ru/api/${uri}`;
    }

    requestConnect(): boolean {
        if (!this.rebind()) {
            return false;
        }

        Actions.connect(this, `content-script-${this.uid}`);

        return true;
    }

    notifyDisconnect(): void {
        if (!this.port) {
            return;
        }

        Actions.postpone(this, 'clear');
    }

    process(action: string, data: { uri: string; poolId: string }): void {
        this.touched = +new Date();

        switch (action) {
            case Actions.FETCH: {
                this.fetch(data.uri, (error, data) => {
                    Actions.data(this, data, error);
                });

                break;
            }

            case Actions.PICK: {
                this.pick(data.poolId, (error, data) => {
                    if (error) {
                        alert(`Task accept error:\n${JSON.stringify(error)}`);
                    } else {
                        window.open(`https://toloka.yandex.ru/task/${data!.poolId}/${data!.id}`, '_blank');
                    }
                });

                break;
            }
        }
    }

    fetch(uri: string, callback: DataCallback<string>) {
        jQuery.ajax({
            url: this.resolve(uri),
            type: 'GET',
            crossDomain: true,
            success: (data: string) => {
                callback(false, data);
            },
            error: callback,
            beforeSend: function (xhr: XMLHttpRequest) {
                xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
                xhr.setRequestHeader('Access-Control-Allow-Origin', '*');
            },
        });
    }

    pick(poolId: string, callback: DataCallback<PoolResponse>) {
        jQuery.ajax({
            url: this.resolve(`assignments`),
            headers: {
                'Access-Control-Allow-Origin': '*',
                'X-CSRF-Token': Cookies.get('toloka-csrftoken'),
            },
            crossDomain: true,
            contentType: 'application/json; charset=utf-8',
            type: 'POST',
            data: JSON.stringify({
                poolId,
            }),
            success: (data: PoolApiResponse) => {
                if (isValidResponse(data)) {
                    callback(false, data);
                } else {
                    callback(data.msg);
                }
            },
            error: function (e: string) {
                callback(e);
            },
        });
    }
}

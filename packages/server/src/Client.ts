import { Actions, ClientPort } from '@beztoloka/domains';

interface ProcessDelegate {
    process<T>(client: Client, action: string, msg: T): void;
}

export class Client extends ClientPort {
    private readonly delegate: ProcessDelegate;

    constructor(delegate: ProcessDelegate, port?: chrome.runtime.Port) {
        super('toloka', port);
        this.delegate = delegate;
    }

    process(action: string, msg: any, uid: string): void {
        if (action === Actions.CONNECT) {
            this.uid = uid;
        }

        this.delegate.process(this, action, msg);
    }
}

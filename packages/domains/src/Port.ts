export abstract class Port {
    public name: string;

    protected constructor(name: string) {
        this.name = Port.portName(name);
    }

    // abstract bind(port?: chrome.runtime.Port): chrome.runtime.Port | void;
    // abstract connect(port: chrome.runtime.Port): void;
    // abstract disconnect(): void;
    // abstract process(action: string, data: D): void;
    abstract send<T>(action: string, data?: T): void;

    static portName(name: string): string {
        return `${name}-data-channel`;
    }
}

export abstract class ClientPort extends Port {
    public uid: string;
    protected port: chrome.runtime.Port | null = null;

    protected constructor(name: string, port?: chrome.runtime.Port) {
        super(name);
        this.uid = `${Math.random()}`;
        this.rebind(port);
    }

    abstract process(action: string, data: unknown, uid: string): void;

    disconnect(): void {
        if (!this.port) {
            return;
        }

        this.port.disconnect();
    }

    rebind(port?: chrome.runtime.Port): chrome.runtime.Port | void {
        return this.bind(port || chrome.runtime.connect({ name: this.name }));
    }

    bind(port?: chrome.runtime.Port): chrome.runtime.Port | void {
        if (!port) {
            return;
        }

        port.onMessage.addListener((msg) => {
            this.process(msg.action, msg.data, msg.uid);
        });

        port.onDisconnect.addListener(() => {
            this.port = null;
        });

        return (this.port = port);
    }

    send<T>(action: string, data?: T): void {
        if (!this.port) {
            return;
        }

        this.port.postMessage({ uid: this.uid, action, data });
    }
}

export abstract class ServerPort<C> extends Port {
    protected constructor(name: string) {
        super(name);

        chrome.runtime.onConnect.addListener((port) => {
            if (port.name !== this.name) {
                return;
            }

            const client = this.connect(port);

            if (client) {
                port.onDisconnect.addListener(() => {
                    this.disconnect(client);
                });
            }
        });
    }

    abstract connect(port: chrome.runtime.Port): C | void;
    abstract disconnect(client: C): void;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    send<T>(action: string, data?: T): void {
        throw new Error('Messages can be send only to specific clients');
    }
}

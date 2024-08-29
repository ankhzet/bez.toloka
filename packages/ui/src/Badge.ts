export class Badge {
    set text(value: string) {
        void chrome.browserAction.setBadgeText({ text: value });
    }

    set background(value: string) {
        void chrome.browserAction.setBadgeBackgroundColor({ color: value });
    }

    hide(): void {
        this.text = '';
    }
}

export class StateBadge extends Badge {
    static NONE = 0;
    static IDLE = 1;
    static WORKING = 2;
    static ACTIVE = 3;
    static FAILURE = 4;

    private readonly COLORS: string[];

    constructor() {
        super();
        this.COLORS = ['#888', '#555', '#00f', '#0f0', '#f00'];
    }

    state(state = 1): void {
        this.background = this.COLORS[state];
    }

    hide(): void {
        this.state(StateBadge.IDLE);
        super.hide();
    }
}

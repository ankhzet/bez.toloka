import { ExtensionConfig } from '@beztoloka/domains';
import { Buzzer } from './Buzzer';

export class Notificator {
    private readonly buzzer: Buzzer;
    private readonly notification: string;

    constructor(notification: string, config: ExtensionConfig) {
        this.notification = notification;
        this.buzzer = new Buzzer(config.buzzerSound, config.buzzerVolume);
    }

    show({ options, click }: { options: any; click: (index: number) => void }, clear = 5000): void {
        const base = Object.assign({ type: 'basic', iconUrl: 'images/icon-128.png' }, options);

        chrome.notifications.create(this.notification, base, () => {
            if (click) {
                const listener = (id: string, button: number) => {
                    chrome.notifications.onButtonClicked.removeListener(listener);
                    click(button);
                };

                chrome.notifications.onButtonClicked.addListener(listener);
            }

            setTimeout(() => this.hide(), clear);

            this.buzzer.buzz();
        });

        chrome.notifications.onClosed.addListener(() => {
            this.buzzer.stop();
        });
    }

    hide(): void {
        chrome.notifications.clear(this.notification);
    }
}

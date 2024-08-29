import { Config } from './Config';

export class ExtensionConfig extends Config {
    static BUZZER_SOUND = 'buzzer-sound';
    static BUZZER_VOLUME = 'buzzer-volume';

    get buzzerSound(): string {
        return this.get(ExtensionConfig.BUZZER_SOUND, '');
    }

    set buzzerSound(path: string) {
        this.set(ExtensionConfig.BUZZER_SOUND, path);
    }

    get buzzerVolume(): number {
        return this.get(ExtensionConfig.BUZZER_VOLUME, 1.0);
    }

    set buzzerVolume(value: number) {
        this.set(ExtensionConfig.BUZZER_VOLUME, value);
    }
}

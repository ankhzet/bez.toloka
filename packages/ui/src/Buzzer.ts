export class Buzzer {
    private _sound?: string;
    private _volume?: number;
    private _audio?: HTMLAudioElement;

    constructor(sound: string, volume = 1.0) {
        this.sound = sound;
        this.volume = volume;
    }

    set sound(value: string) {
        this._sound = value;

        if (!this._audio) {
            return;
        }

        const play = !this.audio.paused;
        this.audio.pause();
        this._audio = undefined;

        if (play) {
            this.buzz();
        }
    }

    set volume(value: number) {
        this._volume = value;

        if (this.audio) {
            this.audio.volume = value;
        }
    }

    get audio(): HTMLAudioElement {
        if (!this._audio) {
            this._audio = new Audio(this._sound);

            if (this._volume !== undefined) {
                this._audio.volume = this._volume;
            }
        }

        return this._audio;
    }

    buzz(): void {
        void this.audio.play();
    }

    stop(): void {
        this.audio.pause();
    }
}

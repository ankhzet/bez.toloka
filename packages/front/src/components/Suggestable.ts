import { TaskData } from '@beztoloka/domains';
import { Selector } from './Selectors';

export abstract class Suggestable<T> extends Selector<T> {
    private readonly fetcher: () => T[];
    private all?: T[];

    constructor(type: string, fetcher: () => T[]) {
        super(type);
        this.fetcher = fetcher;
    }

    suggestions(match: string, lax?: boolean): T[] {
        const inputValue = match.trim().toLowerCase();

        if (!this.all) {
            this.all = this.fetcher();
        }

        const filtered =
            inputValue.length !== 0
                ? this.all.filter((suggestion) =>
                      this.comparable(suggestion).toLocaleLowerCase().startsWith(inputValue),
                  )
                : this.all;

        if (lax && filtered.length !== this.all.length) {
            return [...filtered, ...this.all.filter((i) => !filtered.includes(i))];
        }

        return this.all;
    }
}

type DeepPartial<T> = {
    [P in keyof T]?: DeepPartial<T[P]>;
};

export class TitleSelector extends Suggestable<DeepPartial<TaskData>> {
    comparable(suggestion: TaskData): string {
        return suggestion.tec.title;
    }

    uid(suggestion: TaskData): string {
        return suggestion.tec.poolId;
    }
}

export class RequesterSelector extends Suggestable<DeepPartial<TaskData>> {
    comparable(suggestion: TaskData): string {
        return suggestion.tec.requesterInfo.name.RU;
    }

    uid(suggestion: TaskData): string {
        return suggestion.tec.requesterInfo.id;
    }
}

export interface Matcher<T> {
    match(item: T): boolean;
}

export class CompoundMatcher<T, M extends Matcher<T>> implements Matcher<T> {
    private uidx: number;
    private readonly encapsulated: Record<number, M>;

    constructor(matchers: M[]) {
        this.encapsulated = {};
        this.uidx = 0;

        if (matchers) {
            for (const matcher of matchers) {
                this.add(matcher);
            }
        }
    }

    add(matcher: M): number {
        this.encapsulated[this.uidx] = matcher;

        return this.uidx++;
    }

    remove(matcher: M): void {
        for (const [id, m] of Object.entries(this.encapsulated)) {
            if (m === matcher) {
                delete this.encapsulated[+id];

                break;
            }
        }
    }

    match(item: T): boolean {
        return this.any(item);
    }

    any(item: T): boolean {
        for (const id in this.encapsulated) {
            if (this.encapsulated[id].match(item)) {
                return true;
            }
        }

        return false;
    }

    some(item: T): boolean {
        for (const id in this.encapsulated) {
            if (!this.encapsulated[id].match(item)) {
                return true;
            }
        }

        return false;
    }

    filter(items: T[]): T[] {
        return items.filter((item) => this.match(item));
    }

    map<U>(mapper: (matcher: M, index: number) => U): U[] {
        const result = [];

        for (const id in this.encapsulated) {
            result.push(mapper(this.encapsulated[id], +id));
        }

        return result;
    }
}

export abstract class Selector<T> implements Matcher<T> {
    public type: string;
    public value = '';

    protected constructor(type: string) {
        this.type = type;
    }

    match(item: T): boolean {
        return this.comparable(item) === this.value;
    }

    getLabel(): string {
        return this.type[0].toLocaleUpperCase() + this.type.substr(1);
    }

    abstract comparable(item: T): string;
    abstract suggestions(match: string, lax?: boolean): T[];
}

export class SelectorGroup<T> extends CompoundMatcher<T, Selector<T>> {
    match(item: T): boolean {
        return !this.some(item);
    }
}

export class Filter<T> extends CompoundMatcher<T, SelectorGroup<T>> {
    match(item: T): boolean {
        return this.any(item);
    }
}

export class FilteredAction<T> {
    public filter: Filter<T>;

    constructor(filter: Filter<T>) {
        this.filter = filter;
    }
}

export class Selectors<T> {
    private readonly selectors: Record<string, Selector<T>>;

    constructor(selectors: Selector<T>[]) {
        this.selectors = {};

        for (const selector of selectors) {
            this.register(selector);
        }
    }

    register(selector: Selector<T>): void {
        this.selectors[selector.type] = selector;
    }

    names(): string[] {
        return Object.keys(this.selectors);
    }

    get(type: string): Selector<T> {
        return this.selectors[type];
    }

    each(callback: (selector: Selector<T>) => void): void {
        for (const selector in this.selectors) {
            callback(this.selectors[selector]);
        }
    }

    map<U>(mapper: (selector: Selector<T>, type: string) => U): U[] {
        return Object.entries(this.selectors).map(([type, selector]) => mapper(selector, type));
    }
}

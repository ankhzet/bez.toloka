export class Matcher<T> {
    match(item: T): string|void {
        for (const [property, value] of Object.entries(item)) {
            const method: (value: any) => boolean = (this as any)[property];

            if (method && method.call(this, value)) {
                return property;
            }
        }
    }
}

export class Matchers<T> {
    private readonly matchers: Matcher<T>[];

    constructor(matchers: Matcher<T>[]) {
        this.matchers = matchers;
    }

    match(items: T[]): T[] {
        const result = [];

        for (const item of items) {
            for (const matcher of this.matchers)
                if (matcher.match(item)) {
                    result.push(item);
                    break;
                }
        }

        return result;
    }
}

export class DetailsMatcher<T> extends Matcher<T> {
    tec(value: T): string | void {
        return this.match(value);
    }
}

export class TitleMatcher<T> extends DetailsMatcher<T> {
    private readonly probe: string[];
    private _regexes?: RegExp[];

    constructor(probe: string[]) {
        super()
        this.probe = probe;
    }

    get regexes(): RegExp[] {
        if (this._regexes) {
            return this._regexes;
        }

        const result = [];

        for (const pattern of this.probe) {
            result.push(new RegExp(`^.*${pattern.replace('*', '.*')}.*$`));
        }

        return (this._regexes = result);
    }

    title(value: string) {
        return this.regexes.some((regexp) => value.match(regexp));
    }
}

export class AvailabilityMatcher<T> extends Matcher<T> {
    private readonly probe: boolean;

    constructor(probe?: boolean) {
        super();
        this.probe = !!probe;
    }

    mobile() {
        return false;
    }

    availability(value: string) {
        return this.probe === !!(value || '').match(this.mobile() ? /^AVAILABLE_ON_MOBILE$/i : /^AVAILABLE$/i);
    }
}

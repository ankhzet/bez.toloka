export class Config {
    get<T>(path: string, def: T): T {
        const json = localStorage.getItem(path) || '';

        return json ? JSON.parse(json) : def;
    }

    set<T>(path: string, value: T): void {
        localStorage.setItem(path, JSON.stringify(value));
    }
}

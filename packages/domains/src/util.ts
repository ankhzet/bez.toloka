export class Util {
    static nod(a: number, b: number): number {
        while (a !== b) {
            if (a > b) {
                a -= b;
            } else {
                b -= a;
            }
        }

        return a;
    }

    static denom(set: number[], min: number): number {
        set = set.map((n) => n);

        while (set.length > 1) {
            set.sort((a, b) => b - a);

            set[0] = this.nod(set[0], set[set.length - 1]);
            set = set.filter((n, i) => set.indexOf(n) === i);
        }

        return min ? Math.max(set[0], min) : set[0];
    }
}

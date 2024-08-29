import { Filter, FilteredAction, Selector, SelectorGroup, Selectors } from './Selectors';

export class SelectorsManager<T> {
    private def: string;
    public selectors: Selectors<T>;

    constructor(selectors: Selectors<T>) {
        this.selectors = selectors;
        this.def = selectors.names()[0];
    }

    addSelector(type: string = this.def): Selector<T> {
        return this.selectors.get(type);
    }

    addGroup(): SelectorGroup<T> {
        return new SelectorGroup([this.addSelector()]);
    }

    addFilter(): Filter<T> {
        return new Filter([this.addGroup()]);
    }

    addAction(): FilteredAction<T> {
        return new FilteredAction(this.addFilter());
    }
}

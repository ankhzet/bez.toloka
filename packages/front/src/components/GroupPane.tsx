import React, { useCallback, VFC } from 'react';
import { useUpdate } from 'react-use';

import { SelectorsManager } from './SelectorsManager';
import { SelectorGroup } from './Selectors';
import { SelectorPane } from './SelectorPane';

export const GroupPane: VFC<{ selectors: SelectorsManager<any>; group: SelectorGroup<any> }> = ({
    selectors,
    group,
}) => {
    const update = useUpdate();
    const handleAdd = useCallback(() => {
        group.add(selectors.addSelector());
        update();
    }, [selectors, group]);
    const handleRemove = useCallback(
        (selector) => {
            console.log(group);
            group.remove(selector);
            update();
        },
        [group],
    );

    return (
        <div style={{ padding: 10, border: '1px solid blue', display: 'flex', flexDirection: 'column' }}>
            <div>
                {group.map((selector, i) => (
                    <SelectorPane key={i} selectors={selectors} selector={selector} onRemove={handleRemove} />
                ))}
            </div>
            <div>
                Add selector <a onClick={handleAdd}>+</a>
            </div>
        </div>
    );
};

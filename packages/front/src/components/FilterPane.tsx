import React, { useCallback, VFC } from 'react';
import { useUpdate } from 'react-use';

import { GroupPane } from './GroupPane';
import { SelectorsManager } from './SelectorsManager';
import { Filter } from './Selectors';

export const FilterPane: VFC<{ selectors: SelectorsManager<any>; filter: Filter<any> }> = ({ selectors, filter }) => {
    const update = useUpdate();
    const handleAdd = useCallback(() => {
        filter.add(selectors.addGroup());
        update();
    }, [selectors, filter]);

    return (
        <div style={{ padding: 10, border: '1px solid red', display: 'flex', flexDirection: 'column' }}>
            <div>
                {filter.map((group, i) => (
                    <GroupPane key={i} selectors={selectors} group={group} />
                ))}
            </div>
            <div>
                Add group <a onClick={handleAdd}>+</a>
            </div>
        </div>
    );
};

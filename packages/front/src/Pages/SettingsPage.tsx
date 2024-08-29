import React, { useMemo, VFC } from 'react';

import { ExtensionConfig } from '@beztoloka/domains';
import { FiltersPane, NotificationsPane } from '../components';

export const SettingsPage: VFC = () => {
    const config = useMemo(() => new ExtensionConfig(), []);

    return (
        <div>
            <div className="settings-pane">
                <h4>Filters:</h4>
                <FiltersPane config={config} />
            </div>
            <div className="settings-pane">
                <h4>Notifications:</h4>
                <NotificationsPane config={config} />
            </div>
        </div>
    );
};

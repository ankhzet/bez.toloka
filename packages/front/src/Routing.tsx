import React, { VFC } from 'react';
import { Redirect, Route, Switch } from 'react-router-dom';

import { NotFoundPage, SettingsPage, TasksPage } from './Pages';

export const Routing: VFC = () => {
    return (
        <Switch>
            <Redirect exact from="/" to="/tasks" />
            <Route path="/tasks" component={TasksPage} />
            <Route path="/settings" component={SettingsPage} />
            <Route path="*" component={NotFoundPage} />
        </Switch>
    );
};

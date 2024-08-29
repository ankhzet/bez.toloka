import React from 'react';
import { MemoryRouter } from 'react-router-dom';

import { Popup } from '@beztoloka/front';

import styles from './App.module.scss';

export default function App(): JSX.Element {
    return (
        <MemoryRouter>
            <div className={styles.root}>
                <Popup />
            </div>
        </MemoryRouter>
    );
}

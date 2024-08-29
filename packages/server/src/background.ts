import { Toloka } from './Toloka';

chrome.runtime.onInstalled.addListener(details => {
    console.log('previousVersion', details.previousVersion);
});

const toloka = new Toloka();

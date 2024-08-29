import { TolokaChannel } from './TolokaChannel';

((channel, interval) => {
    window.onbeforeunload = function () {
        return channel.notifyDisconnect();
    };

    const checker = () => {
        const prev = channel.touched;
        const delta = +new Date() - prev;

        if (delta > interval) {
            if (prev) {
                console.log(`Last request ${delta} msec ago (${interval} delay for reconnect)`);
            }

            if (!channel.requestConnect()) {
                console.log('Failed to connect to extension, reloading');
                window.location.reload();
            }
        }
    };

    window.setInterval(checker, interval / 10);
    checker();
})(new TolokaChannel(), 60 * 1000);

const getWorkerImitator = (fn) => {
    const worker = {
        postMessage(data) {
            const result = fn(data);

            if (typeof this.onmessage === 'function') {
                this.onmessage({ data: result });
            } else {
                // eslint-disable-next-line no-console
                console.error('[WORKER IMITATOR ERROR]: Define the onmessage listener');
            }
        },

        terminate: () => null,

        onmessage: null,
    };

    return worker;
}

export const createSafeWorker = (workerClass, fn) => {
    if (window.Worker) {
        return new workerClass();
    }

    return getWorkerImitator(fn);
}
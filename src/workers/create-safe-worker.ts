interface IWebWorker {
    postMessage: (data: any) => void,
    terminate: () => void
    onmessage: null | ( (data: any) => void )
}

type WorkerImitatorCreator = (fn: (data: any) => any) => IWebWorker;

const getWorkerImitator: WorkerImitatorCreator = (fn) => {
    return {
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
}

export const createSafeWorker = (workerClass: any, fn: (data: any) => any) => {
    if (window.Worker) {
        return new workerClass();
    }

    return getWorkerImitator(fn);
}

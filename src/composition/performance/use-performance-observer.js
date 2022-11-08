import { ref, onScopeDispose } from 'vue';

export const usePerformanceObserver = (name, type = 'measure', format = true) => {
    let observer = null
    const result = ref('0ms')
    const setResult = (entry) => {
        if (!format) {
            result.value = entry.duration
        } else {
            result.value = `${entry.duration.toFixed(1)}ms`
        }
    }

    try {
        observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                if (name === entry.name) {
                    setResult(entry)
                }
            }
        });
        observer.observe({ type, buffered: true })
    } catch(err) {}

    const dispose = () => {
        observer.disconnect();
        observer = null;
    }

    onScopeDispose(() => {
        dispose();
    })

    const measure = async (fn) => {
        performance.mark(`${name}:start`);
        const result = await fn();
        performance.mark(`${name}:finish`);
        performance.measure(name, `${name}:start`, `${name}:finish`)
        return result
    }

    const reset = () => {
        result.value = '0ms';
    }

    return {
        result,
        measure,
        reset,
    }
}

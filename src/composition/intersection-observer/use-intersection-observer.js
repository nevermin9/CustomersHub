export const useIntersectionObserver = ({
    root = null,
    target,
    cbWhenShow = () => { },
    cbWhenHide = () => { },
    options = {},
}) => {
    const defaultOptions = {
        root,
        rootMargin: '0px',
        threshold: 1.0,
    };

    const observerOptions = {
        ...defaultOptions,
        ...options,
    };

    const _isIntersecting = ref(undefined);

    const isIntersecting = computed({
        get() {
            return _isIntersecting.value;
        },
        set(val) {
            if (typeof _isIntersecting.value !== 'undefined' && !val) {
                cbWhenHide();
            } else if (val) {
                cbWhenShow();
            }

            _isIntersecting.value = val;
        },
    });

    function observerCallback(entries) {
        for (const entry of entries) {
            isIntersecting.value = entry.isIntersecting;
        }
    }

    function initIntersectionObserver() {
        const observer = new IntersectionObserver(observerCallback, observerOptions);
        observer.observe(target.value);

        onUnmounted(() => {
            observer.disconnect();
        });
    }

    return {
        initIntersectionObserver,
        isIntersecting,
    };
}
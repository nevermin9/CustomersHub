import { ref, computed } from 'vue'

export const usePaginationImitator = (originalDataRef, { perPage }) => {
    const isLoading = ref(false)
    const start = ref(0);

    const paginatedData = computed(() => {
        return [...originalDataRef.value].splice(start.value, perPage);
    })

    const loadPaginatedData = (index) => {
        isLoading.value = true;
        return setTimeout(() => {
            start.value = index;
            isLoading.value = false;
        }, Math.random() * 1000 + 500)
    }

    return {
        isLoading,
        paginatedData,
        loadPaginatedData,
    }
}
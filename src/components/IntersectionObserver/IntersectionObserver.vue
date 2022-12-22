<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useIntersectionObserver } from '@/composition/intersection-observer'

const props = defineProps({
    config: {
        type: Object,
        default: () => ({
            root: null,
            rootMargin: '0px',
            threshold: 0,
        }),
    },
})

const target = ref(null)

const emit = defineEmits(['is-shown', 'is-hidden'])

const cbWhenShow = () => {
    emit('is-shown')
}

const cbWhenHide = () => {
    emit('is-hidden')
}

const { initIntersectionObserver } = useIntersectionObserver({
    target,
    cbWhenHide,
    cbWhenShow,
    options: props.options,
})

onMounted(() => initIntersectionObserver())

</script>

<template>
    <div ref="target"></div>
</template>

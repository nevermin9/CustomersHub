<script setup>
defineProps({
    metrics: {
        type: Array,
        required: true,
    }
})
</script>

<template>
    <ul
        class="flex justify-content-start gap-5 w-full px-7 bg-black-alpha-90"
    >
        <li
            v-for="(metric, i) in metrics"
            class="flex gap-2"
        >
            <span v-tooltip.bottom="metric.tooltip">
                {{ metric.name }}
            </span>

            <span :class="metric.colorClass">
                {{ metric.value }}
            </span>

        </li>
    </ul>
</template>
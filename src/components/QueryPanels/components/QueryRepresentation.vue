<script setup>
import { computed } from 'vue'
import ConditionRaw from '@/components/QueryPanels/helpers/ConditionRow';

const props = defineProps({
    cols: {
        type: Array,
    },
    conditions: {
        type: Array,
    }
})

const displayedCols = computed(() => {
    if (props.cols?.length) {
        return props.cols;
    }
    return ['*']
});

const firstGroup = computed(() => [...props.conditions].splice(0, 1).flat());
const otherGroups = computed(() => [...props.conditions].splice(1));
const getConditionStr = (condition) => {
    const equalitySign = condition.isInverted ? '!=' : '=';
    return `${condition.column} ${equalitySign} ${condition.value}`;
}
</script>

<template>

    <div class="flex align-items-center">
        <table
            id="query-table"
            class="w-full"
        >

            <tr>
                <th class="w-2 py-2 border-solid border-1 border-400 bg-blue-300">
                    COLUMNS
                </th>

                <tr class="flex p-2 border-solid border-1 border-400">
                    <span
                        v-for="(col, i) in displayedCols"
                        :key="i"
                    >
                        {{ col }}
                        <span v-if="i !== displayedCols.length - 1">,</span>
                    </span>
                </tr>
            </tr>

            <tr
                v-if="firstGroup && firstGroup.length"
            >
                <th class="w-2 py-2 border-solid border-1 border-400 bg-blue-300">
                    WHERE
                </th>

                <tr class="flex p-2 border-solid border-1 border-400">
                    <span
                        v-for="(condition, i) in firstGroup"
                        :key="i"
                    >
                        {{ getConditionStr(condition) }}
                        <span v-if="i !== firstGroup.length - 1">,</span>
                    </span>
                </tr>
            </tr>

            <template v-if="otherGroups.length">
                <tr
                    v-for="(group, i) in otherGroups"
                    :key="i"
                >
                    <th class="w-2 py-2 border-solid border-1 border-400 bg-blue-300">
                        OR
                    </th>

                    <tr class="flex p-2 border-solid border-1 border-400">
                        <p>
                            <span
                                v-for="(condition, i) in group"
                                :key="i"
                            >
                                {{ getConditionStr(condition) }}
                                <span v-if="i !== firstGroup.length - 1">,</span>
                            </span>
                        </p>
                    </tr>
                </tr>
            </template>
        </table>
    </div>
</template>

<style lang="scss">
#query-table {
    border-collapse: collapse;
}
.query-table {
    // font-family: code;

    &__row-head {
    }

    &__row-cell {
        display: flex;
    }

    &__row-head,
    &__row-cell {
        border: 1px solid #ddd;
        padding: 0.5rem;
    }
}
</style>
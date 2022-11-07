<script setup>
import { QUERY_PANEL_KEY } from '@/components/QueryPanels/config'
import {
    computed,
    inject,
    ref,
    reactive,
    toRaw,
} from 'vue'
import Splitter from 'primevue/splitter';
import SplitterPanel from 'primevue/splitterpanel';
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox';
import { default as PrimeButton } from 'primevue/button'
import Dropdown from 'primevue/dropdown'
import SelectButton from 'primevue/selectbutton';
import InputText from 'primevue/inputtext';
import QueryRepresentation from '@/components/QueryPanels/components/QueryRepresentation.vue';
import ConditionRow from '@/components/QueryPanels/models/condition-row';
import { usePerformanceObserver } from '@/composition/performance';
import { makeSearch, makeDistinct } from '@/components/QueryPanels/workers/functions'
import MakeSearchWorker from '@/components/QueryPanels/workers/make-search.worker.js?worker'
import MakeDistinctWorker from '@/components/QueryPanels/workers/make-distinct.worker.js?worker'
import { createSafeWorker } from '@/workers'

const makeSearchWorker = createSafeWorker(MakeSearchWorker, makeSearch)
const makeDistinctWorker = createSafeWorker(MakeDistinctWorker, makeDistinct)

const PERF_MARK_NAME = 'select-panel';
const {
    measure,
    result: measurementResult,
    reset: resetMeasurementResult,
} = usePerformanceObserver(PERF_MARK_NAME)

const {
    displayableColumns,
    setDisplayableData,
    setDisplayableColumns,
    allData,
    allColumns,
    startLoading,
    finishLoading,
} = inject(QUERY_PANEL_KEY);

const getRawData = (refValue) => {
    const rawData = JSON.parse(JSON.stringify(refValue.value));
    return rawData;
}

const $selectedColumns = ref([]);
const selectedColumns = computed({
    get() {
        return $selectedColumns.value;
    },
    set(val) {
        if (val.length) {
            setDisplayableColumns(val);
        } else {
            setDisplayableColumns(allColumns.value);
        }
        $selectedColumns.value = val;
        handleData();
    }
});

const sendWorkerToMakeDistinct = () => {
    startLoading();
    return new Promise((resolve) => {
        const rawData = getRawData(allData);
        const rawCols = getRawData(selectedColumns)
        makeDistinctWorker.onmessage = (e) => {
            finishLoading();
            return resolve(e.data);
        }
        makeDistinctWorker.postMessage({
            data: rawData,
            cols: rawCols,
        });
    })
}

const $isDistinct = ref(false);
const isDistinct = computed({
    get() {
        return $isDistinct.value;
    },
    set(val) {
        $isDistinct.value = val;
        handleData();
    }
})

const conditions = reactive([]);
const conditionCol = ref('')
const conditionVal = ref('')
const isInverted = ref(false);
const INVERTED_OPTIONS = [
    {
        label: 'IS',
        value: false,
    },
    {
        label: 'IS NOT',
        value: true,
    }
];
const COMBINATORS = {
    AND: 'AND',
    OR: 'OR',
}
const combinator = ref('');


const getData = () => {
    // add caching
    return allData.value;
}

const handleData = async () => {
    let data = getData();
    if (isDistinct.value && selectedColumns.value.length
        && displayableColumns.value.length !== allColumns.value.length) {
        data = await measure(sendWorkerToMakeDistinct)
    }

    if (conditions.length) {
        data = await measure(sendWorkerToSearch)
    }

    setDisplayableData(data);
}

const sendWorkerToSearch = () => {
    startLoading();
    return new Promise((resolve) => {
        const rawData = getRawData(allData)
        const rawConditions = toRaw(conditions)
        makeSearchWorker.onmessage = (e) => {
            finishLoading();
            return resolve(e.data)
        }
        makeSearchWorker.postMessage({
            data: [...rawData],
            conditions: [...rawConditions],
        });
    })
}

const resetConditions = () => {
    conditionVal.value = '';
    conditionCol.value = '';
    combinator.value = COMBINATORS.AND;
}

const addCondition = () => {
    const column = conditionCol.value;
    const value = conditionVal.value;
    const comb = combinator.value;
    resetConditions();
    const conditionRow = new ConditionRow({
        column,
        value,
        combinator: comb,
        isInverted: isInverted.value,
    })
    if (comb === 'OR' || conditions.length === 0) {
        const group = [ conditionRow ];
        conditions.push(group)
        handleData();
        return;
    }
    const lastIndex = conditions.length - 1;
    conditions[lastIndex].push(conditionRow)
    handleData();
}


const clear = () => {
    resetConditions();
    conditions.splice(0);
    handleData();
    resetMeasurementResult();
}
</script>

<template>
    <Splitter class="h-15rem w-full">
        <SplitterPanel
            id="control-panel"
            :min-size="55"
            class="p-3"
        >
            <form class="flex flex-column">
                <ul class="flex flex-column gap-4">
                    <li class="flex align-items-center gap-2">
                        <MultiSelect
                            v-model="selectedColumns"
                            :options="allColumns"
                            placeholder="Select columns"
                        />

                        <div class="flex align-items-center gap-1">
                            <Checkbox
                                inputId="is-distinct"
                                v-model="isDistinct"
                                binary
                            />

                            <label
                                class="cursor-pointer"
                                for="is-distinct"
                            >
                                Distinct values
                            </label>
                        </div>
                    </li>

                    <li class="flex flex-column gap-2">
                        <div class="flex gap-2">
                            <div class="flex align-items-center gap-1">
                                <label
                                    v-if="conditions.length === 0"
                                    for="conditional-col"
                                >
                                    WHERE
                                </label>

                                <div v-else>
                                    <Dropdown
                                        v-model="combinator"
                                        :options="[COMBINATORS.AND, COMBINATORS.OR]"
                                    />
                                </div>

                                <Dropdown
                                    v-model="conditionCol"
                                    :options="allColumns"
                                    placeholder="Column"
                                    input-id="conditional-col"
                                />
                            </div>

                            <div>
                                <SelectButton
                                    v-model="isInverted"
                                    :options="INVERTED_OPTIONS"
                                    option-value="value"
                                    option-label="label"
                                />
                            </div>

                            <div>
                                <InputText
                                    v-model="conditionVal"
                                    type="text"
                                    placeholder="Value"
                                    input-id="conditional-value"
                                />
                            </div>

                        </div>

                        <div class="flex gap-2 align-items-center">
                            <PrimeButton
                                label="Add condition"
                                @click="() => addCondition()"
                            />

                            <p>
                                <span>
                                    Last operation takes: 
                                </span>

                                <span>
                                    {{ measurementResult }}
                                </span>
                            </p>
                        </div>
                    </li>
                </ul>

            </form>
        </SplitterPanel>

        <SplitterPanel
            id="query-display"
            :size="30"
            :max-size="30"
        >
            <div class="flex flex-column gap-2 h-full p-3">
                <QueryRepresentation
                    class="w-full"
                    :cols="selectedColumns"
                    :conditions="conditions"
                />

                <div>
                    <PrimeButton
                        label="Clear"
                        @click="() => clear()"
                    />
                </div>
            </div>
        </SplitterPanel>
    </Splitter>

</template>
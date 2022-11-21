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
import InputSwitch from 'primevue/inputswitch';

import { usePerformanceObserver } from '@/composition/performance';
import { doSearch, doDistinct } from '@/components/QueryPanels/workers/functions'
import DoSearchWorker from '@/components/QueryPanels/workers/do-search.worker.js?worker'
import DoDistinctWorker from '@/components/QueryPanels/workers/do-distinct.worker.js?worker'
import { createSafeWorker } from '@/workers'

const doSearchWorker = createSafeWorker(DoSearchWorker, doSearch)
const doDistinctWorker = createSafeWorker(DoDistinctWorker, doDistinct)

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

const wantUseWorkers = ref(true);

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

const sendWorkerToDoDistinct = () => {
    startLoading();
    return new Promise((resolve) => {
        const rawData = getRawData(allData);
        const rawCols = getRawData(selectedColumns)
        doDistinctWorker.onmessage = (e) => {
            finishLoading();
            return resolve(e.data);
        }
        doDistinctWorker.postMessage({
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

const makeChoice = async (fn1, fn2, cond) => {
    if (cond) {
        return await fn1()
    }
    return await fn2()
}

const handleData = async () => {
    let data = getData();
    if (isDistinct.value && selectedColumns.value.length
        && displayableColumns.value.length !== allColumns.value.length) {

        data = await makeChoice(
            async () => measure(sendWorkerToDoDistinct),
            async () => measure(async () => doDistinct(
                {
                    data: getRawData(allData),
                    cols: getRawData(selectedColumns)
                }
            )),
            wantUseWorkers.value
        )
    }

    if (conditions.length) {
        data = await makeChoice(
            async () => measure(sendWorkerDoSearch),
            async () => measure(async () => doSearch(
                {
                    data: getRawData(allData),
                    conditions: toRaw(conditions)
                }
            )),
            wantUseWorkers.value
        )
    }

    setDisplayableData(data);
}

const sendWorkerDoSearch = () => {
    startLoading();
    return new Promise((resolve) => {
        const rawData = getRawData(allData)
        const rawConditions = toRaw(conditions)
        doSearchWorker.onmessage = (e) => {
            finishLoading();
            return resolve(e.data)
        }
        doSearchWorker.postMessage({
            data: [...rawData],
            conditions: [...rawConditions],
        });
    })
}

const resetConditions = () => {
    conditionVal.value = '';
    conditionCol.value = '';
    combinator.value = COMBINATORS.AND;
    isInverted.value = false;
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
    isDistinct.value = false;
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
            <div>
                <p>
                    Do you want to use workers?
                    <span v-if="wantUseWorkers">
                        Yes
                    </span>

                    <span v-else>
                        No
                    </span>
                </p>

                <InputSwitch v-model="wantUseWorkers"/>
            </div>

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
                                    class="font-bold"
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

                            <div class="flex align-items-center">
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

                            <p class="font-bold">
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
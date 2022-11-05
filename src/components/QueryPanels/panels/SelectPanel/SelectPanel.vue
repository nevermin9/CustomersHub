<script setup>
import { QUERY_PANEL_KEY } from '@/components/QueryPanels/config'
import {
    computed,
    inject,
    ref,
    reactive,
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
import debounce from 'lodash.debounce'
import ConditionRow from '@/components/QueryPanels/helpers/ConditionRow';

const {
    displayableData,
    displayableColumns,
    setDisplayableData,
    setDisplayableColumns,
    allData,
    allColumns,
} = inject(QUERY_PANEL_KEY);

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

const handleData = () => {
    // cache result;
    // CACHE
    let data = getData();
    if (isDistinct.value && selectedColumns.value.length) {
        data = makeDistinct([...data]);
    }
    if (conditions.length) {
        data = makeSearch([...data]);
    }

    setDisplayableData(data);
}

const makeDistinct = (data) => {
    if (displayableColumns.value.length === allColumns.value.length) {
        return data;
    }

    let result = [];
    const values = [];

    for (let i = 0; i < displayableColumns.value.length; i++) {
        const col = displayableColumns.value[i];
        const currentResult = [];

        for (const item of data) {
            const val = item[col];
            if (values.indexOf(val) < 0) {
                currentResult.push(item);
                values.push(val)
            }
        }

        if (currentResult.length >= result.length) {
            result = currentResult;
        }
    }

    return result;
}

const makeSearch = (data) => {
    let result = [];

    for (const group of conditions) {
        const groupResult = [];

        for (const item of data) {
            const candidate = group.reduce(($item, condition) => {
                if ($item === null) return null

                const condCol = condition.column;
                const condVal = condition.value;
                const isInverted = condition.isInverted;

                if ((isInverted && !$item[condCol].startsWith(condVal))
                    || (!condition.isInverted && $item[condCol].startsWith(condVal))) {
                        // cache hear
                    return $item;
                }

                return null;
            }, item)

            candidate && groupResult.push(candidate);
        }
        result = result.concat(groupResult)
    }

    return result;
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
                <ul class="flex flex-column gap-2">
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

                    <li class="flex flex-column">
                        <h4>
                            Make condition
                        </h4>

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

                        <div>
                            <PrimeButton
                                label="Add condition"
                                @click="() => addCondition()"
                            />
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
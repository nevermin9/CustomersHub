<script setup lang="ts">
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
import Panel from "primevue/panel"

import { usePerformanceObserver } from '@/composition/performance';
import { doSearch, doDistinct } from '@/components/QueryPanels/workers/functions'
import DoSearchWorker from "@/components/QueryPanels/workers/do-search.worker.js?worker"
import DoDistinctWorker from "@/components/QueryPanels/workers/do-distinct.worker.js?worker"
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
      data: [ ...rawData ],
      conditions: [ ...rawConditions ],
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
  <section
    id="select-panel"
    class="grid grid-cols-3"
  >
    <div class="flex flex-col">
      <label for="is-distinct">
        <InputSwitch v-model="isDistinct" input-id="is-distinct" />

        <span>
          Distinct values
        </span>
      </label>

      <label for="want-use-workers">
        <InputSwitch v-model="wantUseWorkers" input-id="want-use-workers" />

        <span>
          Use web workers
        </span>
      </label>
    </div>

    <table class="">
      <tr>
        <td class="p-1">
          <span class="uppercase">
            select
          </span>
        </td>

        <td class="p-1">
          <MultiSelect
            v-model="selectedColumns"
            :options="allColumns"
            class="w-full md:w-full"
            placeholder="Select columns"
          />
        </td>
      </tr>

      <tr>
        <td></td>

        <td class="p-1">
          <SelectButton v-model="combinator" :options="['AND', 'OR']" />
        </td>
      </tr>

      <tr>
        <td class="p-1">
          <span class="uppercase">
            where
          </span>
        </td>

        <td class="p-1">
          <Dropdown
            v-model="conditionCol"
            :options="allColumns"
            placeholder="Column"
            class="w-full md:w-full"
          />
        </td>
      </tr>

      <tr>
        <td class="p-1">
          <span class="uppercase">
            is

            <Transition name="fade-30" mode="out-in">
              <span v-if="!isInverted" class="opacity-30">
                not
              </span>

             <span v-else>
               not
             </span>
            </Transition>
          </span>
        </td>

        <td class="p-1">
          <InputSwitch v-model="isInverted" />
        </td>
      </tr>

      <tr>
        <td>
          <span class="uppercase">
            Value
          </span>
        </td>

        <td>
          <InputText
            v-model="conditionVal"
            type="text"
            placeholder="Value"
           />
        </td>
      </tr>
    </table>

    <div></div>
  </section>
<!--  <Panel-->
<!--    header="SELECT DATA"-->
<!--    class="h-full"-->
<!--  >-->

<!--  </Panel>-->
<!--  <Splitter class="h-15rem w-full">-->
<!--    <SplitterPanel-->
<!--      id="control-panel"-->
<!--      :min-size="55"-->
<!--      class="p-3"-->
<!--    >-->
<!--      <form class="flex">-->
<!--        <div class="flex flex-col">-->
<!--        </div>-->

<!--        <ul class="grid grid-cols-2">-->
<!--          <li class="flex items-center gap-2">-->
<!--            <span class="uppercase">-->
<!--              select-->
<!--            </span>-->
<!--          </li>-->

<!--          <li>-->
<!--            <MultiSelect-->
<!--              v-model="selectedColumns"-->
<!--              :options="allColumns"-->
<!--              placeholder="Select columns"-->
<!--            />-->
<!--          </li>-->

<!--          <li class="flex items-center gap-2">-->
<!--            and/or-->
<!--          </li>-->

<!--          <li>-->
<!--            input method-->
<!--          </li>-->

<!--          <li>-->
<!--            <span class="uppercase">-->
<!--              where-->
<!--            </span>-->
<!--          </li>-->

<!--          <li class="flex items-center gap-2">-->
<!--          </li>-->

<!--          <li>-->
<!--            is not-->
<!--          </li>-->

<!--          <li>-->
<!--            input methods 2-->
<!--          </li>-->

<!--          <li>-->
<!--            <InputText-->
<!--              v-model="conditionVal"-->
<!--              type="text"-->
<!--              placeholder="Value"-->
<!--              input-id="conditional-value"-->
<!--            />-->
<!--          </li>-->
<!--        </ul>-->

<!--      </form>-->
<!--    </SplitterPanel>-->

<!--    <SplitterPanel-->
<!--      id="query-display"-->
<!--      :size="30"-->
<!--      :max-size="30"-->
<!--    >-->
<!--      <div class="flex flex-col gap-2 h-full p-3">-->
<!--        <QueryRepresentation-->
<!--          class="w-full"-->
<!--          :cols="selectedColumns"-->
<!--          :conditions="conditions"-->
<!--        />-->

<!--        <div>-->
<!--          <PrimeButton-->
<!--            label="Clear"-->
<!--            @click="() => clear()"-->
<!--          />-->
<!--        </div>-->
<!--      </div>-->
<!--    </SplitterPanel>-->
<!--  </Splitter>-->

</template>

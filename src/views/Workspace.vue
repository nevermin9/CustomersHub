<script setup lang="ts">
import {
  onMounted,
  provide,
} from 'vue'
import { QUERY_PANEL_KEY } from '@/components/QueryPanels/config';
import QueryPanelsProvide from '@/components/QueryPanels/models/query-panels-provide';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import QueryPanels from '@/components/QueryPanels/QueryPanels.vue';
import { useCustomers } from '@/composition/customers';
import { usePaginationImitator } from '@/composition/pagination';

const {
  loadCustomers,
  displayableColumns,
  displayableCustomers,
  setDisplayableColumns,
  setDisplayableCustomers,
  allCustomers,
  allColumns,
  DATA_KEY,
} = useCustomers();

const PER_PAGE = 10;
const {
  paginatedData,
  loadPaginatedData,
  isLoading,
} = usePaginationImitator(displayableCustomers, {
  perPage: PER_PAGE,
})

provide(QUERY_PANEL_KEY, new QueryPanelsProvide({
  displayableColumns,
  displayableData: displayableCustomers,
  setDisplayableColumns,
  setDisplayableData: setDisplayableCustomers,
  allData: allCustomers,
  allColumns,
  startLoading() {
    isLoading.value = true;
  },
  finishLoading() {
    isLoading.value = false;
  }
}));

const onPage = (event) => {
  return loadPaginatedData(event.first);
}

onMounted(async () => {
  await loadCustomers();
})

</script>

<template>
  <section class="flex flex-col">
    <div class="flex flex-col w-full mb-4">
      <h2 class="text-center py-4 mb-2">
        Write your SQL query to retrieve data
      </h2>
    </div>

    <QueryPanels
      v-if="displayableColumns.length"
    />

    <div>
      <p>
        Rows count:
        <span>
                    {{ displayableCustomers.length }}
                </span>
      </p>
    </div>

    <div v-if="displayableColumns.length">
      <DataTable
        lazy
        paginator
        :rows="PER_PAGE"
        :data-key="DATA_KEY"
        :total-records="displayableCustomers.length"
        :loading="isLoading"
        show-gridlines
        responsive-layout="scroll"
        breakpoint="960px"
        scroll-direction=""
        :value="paginatedData"
        @page="(event) => onPage(event)"
      >
        <Column
          v-for="(col, i) in displayableColumns"
          :key="i"
          :field="col"
          :header="col"
        />
      </DataTable>
    </div>

  </section>

</template>

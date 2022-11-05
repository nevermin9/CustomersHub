<script setup>
import {
    ref,
    onMounted,
    provide,
} from 'vue'
import { QUERY_PANEL_KEY } from '@/components/QueryPanels/config';
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import QueryPanelsVue from '@/components/QueryPanels/QueryPanels.vue';
import { useCustomers } from '@/composition/customers/use-customers';

const {
    loadCustomers,
    displayableColumns,
    displayableCustomers,
    setDisplayableColumns,
    setDisplayableCustomers,
    allCustomers,
    allColumns,
} = useCustomers();

provide(QUERY_PANEL_KEY, {
    displayableColumns,
    displayableData: displayableCustomers,
    setDisplayableColumns,
    setDisplayableData: setDisplayableCustomers,
    allData: allCustomers,
    allColumns,
});

onMounted(async () => {
    await loadCustomers();
})

</script>

<template>
    <section class="flex flex-column">
        <div class="flex flex-column w-full mb-4">
            <h2 class="text-center py-4 mb-2">
                Write your SQL query to retrieve data
            </h2>
        </div>

        <QueryPanelsVue
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
                show-gridlines
                responsive-layout="scroll"
                breakpoint="960px"
                scroll-direction=""
                :value="displayableCustomers"
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
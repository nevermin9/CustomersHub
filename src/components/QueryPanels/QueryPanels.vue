<script setup>
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import SelectPanel from './panels/SelectPanel/SelectPanel.vue';

const OPERATIONS_PANELS = {
    SELECT: {
        label: 'SELECT',
        disabled: false,
        component: SelectPanel,
    },
    INSERT: {
        label: 'INSERT',
        disabled: true,
        component: null,
    },
    DELETE: {
        label: 'DELETE',
        disabled: false,
        component: null,
    },
}
</script>

<template>
    <section class="flex">
        <TabView class="w-full">
            <TabPanel
                v-for="(operation, i) in OPERATIONS_PANELS"
                :header="operation.label"
                :disabled="operation.disabled || operation.component === null"
            >
                <component :is="operation.component" />
            </TabPanel>
        </TabView>
    </section>
</template>

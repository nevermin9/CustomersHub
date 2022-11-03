<script setup>
import {
    onMounted,
    computed,
    ref,
    watch,
} from 'vue'
import Papa from 'papaparse'
import InputText from 'primevue/inputtext'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Dropdown from 'primevue/dropdown'
import MultiSelect from 'primevue/multiselect'
import Checkbox from 'primevue/checkbox';

/**
 * SELECT * FROM customers -> 'SELECT * FROM ($1)', ['customers']
 * SELECT col1, col2 FROM customers => 
    * SELECT ($3), ($2) FROM ($1), ['customers', 'col2', 'col1']
 * SELECT DISTINCT col1, col2 FROM customers => 
    * SELECT DISTINCT ($3), ($2) FROM ($1), ['customers', 'col2', 'col1']
 * SELECT DISTINCT col1, col2 FROM customers WHERE col1='foo' col2='bar' => 
    * SELECT DISTINCT ($3), ($2) FROM ($1), ['customers', 'col2', 'col1']
    * WHERE 
 * 
 */

const input = ref('');

const NULL = 'NULL';

const SELECT = 'SELECT';

const query = 'SELECT customerId, companyName FROM customers';
console.log(query.split(' '));

const SQL = {
    SELECT: {}
};

const allCustomers = ref([]);
const filteredCustomers = ref([]);
const displayableCustomers = computed(() => {
    if (filteredCustomers.value.length) {
        return filteredCustomers.value;
    }
    return allCustomers.value;
})


const options = ['SELECT', 'DELETE', 'INSERT'];
const selectedOption = ref(options[0]);

const availableColumns = ref([]);
const selectedColumns = ref([]);
const displayableColumns = computed(() => {
    if (selectedColumns.value.length) {
        return selectedColumns.value;
    }

    return availableColumns.value;
});
watch(() => displayableColumns.value, (val, old) => {
    console.log('val', val);
    console.log('old', old);
})

const makeDistinct = () => {
    if (displayableColumns.value.length === availableColumns.value.length) {
        return;
    }

    let result = [];
    const values = [];

    for (let i = 0; i < displayableColumns.value.length; i++) {
        const col = displayableColumns.value[i];
        const currentResult = [];

        for (const customer of allCustomers.value) {
            const val = customer[col];
            if (values.indexOf(val) < 0) {
                currentResult.push(customer);
                values.push(val)
            }
        }

        if (currentResult.length >= result.length) {
            result = currentResult;
        }
    }

    filteredCustomers.value = result;
}
const $distinct = ref(false);
const distinct = computed({
    get() {
        return $distinct.value;
    },
    set(val) {
        if (val) {
            makeDistinct();
        } else {
            filteredCustomers.value = [];
        }
        $distinct.value = val;
    }
})


const getData = (path) => {
    return fetch(path)
        .then((result) => {
            return result.text();
        })
}

// const mapCustomers = ref(new Map);

onMounted(async () => {
    const data = await getData('/customers.csv');
    allCustomers.value = Papa.parse(data, { header: true }).data;
    availableColumns.value = Object.keys(allCustomers.value[0]);

    // for (const customer of customers.value) {
    //     mapCustomers.value.set(customer.customerID, customer);
    // }
})

</script>

<template>
    <section class="flex flex-column px-4">
        <article class="flex flex-column w-full mb-4">
            <h2 class="text-center py-4 mb-2">
                Write your SQL query to retrieve data
            </h2>

            <form class="flex w-full">
                <div>
                    <Dropdown v-model="selectedOption" :options="options" />
                </div>

                <div class="">
                    <MultiSelect
                        v-model="selectedColumns"
                        :options="availableColumns"
                        placeholder="Select columns"
                    />
                </div>

                <div class="">
                    <Checkbox
                        inputId="distinct"
                        v-model="distinct"
                        binary
                    />

                    <label class="cursor-pointer" for="distinct">
                        distinct
                    </label>
                </div>
            </form>
        </article>

        <article v-if="displayableColumns.length">
            <DataTable
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
        </article>
    </section>
</template>

<style scoped>

</style>

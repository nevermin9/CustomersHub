import { ref } from 'vue';
import Papa from 'papaparse'

const PATH = '/customers.csv'

export const useCustomers = () => {
    const DATA_KEY = 'customerId'
    const allCustomers = ref([]);
    const allColumns = ref([]);

    const loadCustomers = async () => {
        const data = await (await fetch(PATH)).text()
        const parsed = Papa.parse(data, { header: true }).data
        if (parsed.length) {
            allCustomers.value = parsed;
            allColumns.value = Object.keys(parsed[0]);
            setDisplayableCustomers(parsed);
            setDisplayableColumns(Object.keys(parsed[0]));
        }
    }

    const displayableCustomers = ref([]);
    const setDisplayableCustomers = (arr) => {
        displayableCustomers.value = arr;
    }
    const displayableColumns = ref([])
    const setDisplayableColumns = (arr) => {
        displayableColumns.value = arr;
    }

    return {
        loadCustomers,
        allCustomers,
        allColumns,
        displayableColumns,
        setDisplayableColumns,
        displayableCustomers,
        setDisplayableCustomers,
        DATA_KEY,
    }
}

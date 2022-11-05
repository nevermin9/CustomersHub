<script setup>
import {
    ref
} from 'vue'
import Dropdown from 'primevue/dropdown'
import InputText from 'primevue/inputtext';
import SelectButton from 'primevue/selectbutton';

defineProps({
    conditionIndex: {
        type: Number,
        required: true,
    }
});
const COMBINATORS = {
    AND: 'AND',
    OR: 'OR',
}
const combinator = ref('');

</script>

<template>
    <div class="flex gap-2">
        <div class="flex align-items-center gap-1">
            <label
                v-if="conditionIndex === 0"
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
                :options="availableColumns"
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
</template>
<script setup>
import {ref} from 'vue'
import Workspace from '@/views/Workspace.vue';
import MetricInfo from '@/components/MetricsInfo/models/metric-info';
import MetricsInfo from '@/components/MetricsInfo/MetricsInfo.vue';
import {METRICS_ABBR, METRICS_RATING_COLOR} from '@/components/MetricsInfo/config';
import {onLCP, onFID, onTTFB} from 'web-vitals'

const metrics = ref([]);
const createMetricInfo = (webVitalMetric) => {
  metrics.value.push(new MetricInfo({
    name: webVitalMetric.name,
    tooltip: METRICS_ABBR[webVitalMetric.name],
    colorClass: METRICS_RATING_COLOR[webVitalMetric.rating],
    value: `${webVitalMetric.value.toFixed(1)}ms`,
  }))
}
onLCP(createMetricInfo);
onFID(createMetricInfo)
onTTFB(createMetricInfo)
</script>

<template>
  <aside class="h-2rem relative">
    <MetricsInfo class="fixed z-5" :metrics="metrics"/>
  </aside>

  <main class="flex flex-column px-4">
    <Workspace/>
  </main>
</template>

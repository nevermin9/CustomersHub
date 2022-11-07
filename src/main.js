import './styles/styles.scss'
import 'primevue/resources/themes/md-dark-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip';

const app = createApp(App)
    .use(PrimeVue)
app.directive('tooltip', Tooltip)

app.mount('#app')
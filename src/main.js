import './styles/styles.scss'
import 'primevue/resources/themes/md-dark-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import 'primeflex/primeflex.css'
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'

createApp(App)
    .use(PrimeVue)
    .mount('#app')

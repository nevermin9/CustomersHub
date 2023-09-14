import './styles/styles.scss'
import 'primevue/resources/themes/md-dark-indigo/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';
import Tailwind from "primevue/passthrough/tailwind"
import { createApp } from 'vue'
import App from './App.vue'
import PrimeVue from 'primevue/config'
import Tooltip from 'primevue/tooltip';
import {usePassThrough} from "primevue/passthrough"
import customStyles from "./custom-styles"

const CustomTailwind = usePassThrough(Tailwind, customStyles)

const app = createApp(App)
    .use(PrimeVue, {unstyled: true, pt: CustomTailwind})
app.directive('tooltip', Tooltip)

app.mount('#app')

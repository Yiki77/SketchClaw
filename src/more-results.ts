import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import MoreResults from './components/sections/MoreResults.vue'

const app = createApp(MoreResults)

app.use(ElementPlus)
app.mount('#app')
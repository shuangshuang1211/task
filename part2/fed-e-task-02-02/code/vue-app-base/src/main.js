import Vue from 'vue'
import App from './App.vue'

import './styles/style.less'
import './js/test.js'

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')

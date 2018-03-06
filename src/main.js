import Vue from 'vue'
import App from './App'
import router from './router'

// eslint-disable-next-line
import 'babel-polyfill'
import fastclick from 'fastclick'

// 懒加载
import VueLazyload from 'vue-lazyload'

// store
import store from './store'

Vue.use(VueLazyload, {
  loading: require('common/image/default.png')
})

// 移动端点击不会有 300 毫秒的延迟
fastclick.attach(document.body)

Vue.config.productionTip = false

// eslint-disable-next-line
import 'common/stylus/index.styl'

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})

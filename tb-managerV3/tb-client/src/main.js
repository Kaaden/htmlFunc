
import Vue from 'vue';
import axios from 'axios';
import router from './router';
import ElementUI from 'element-ui';
import "./assets/base.css";
import VueAxios from 'vue-axios'
import "./assets/dzicon.css";
import 'element-ui/lib/theme-chalk/index.css';
import App from './App';
Vue.config.productionTip = false
Vue.use(ElementUI)
Vue.use(VueAxios, axios)
new Vue({
  el: '#app',
  router,
  components: {
    App
  },
  template: '<App/>',
  watch: {
    $route() {
      document.title = this.$route.meta.title
    }
  },

}).$mount('#app')

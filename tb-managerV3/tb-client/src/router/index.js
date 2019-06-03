import Vue from 'vue'
import Router from 'vue-router'
import Index from "@/components/index";
import Login from "@/components/login";

Vue.use(Router)

export default new Router({
  mode: 'history',  // 这样设置后，就可以去掉url中丑丑的“#”啦
  routes: [{
    path: '/',
    name: 'login',
    component: Login,
    meta: {
      title: 'manage'
    }
  },
  {
    path: '/index',
    name: 'index',
    component: Index,
    meta: {
      title: 'manage'
    }
  }
  ]
})

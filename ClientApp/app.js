import Vue from 'vue'
import axios from 'axios'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import App from 'components/app-root'
import HomePage from 'components/home-page'

Vue.prototype.$http = axios;

sync(store, router)

const app = new Vue({
    store,
    router,
    ...HomePage
})

export {
    app,
    router,
    store
}
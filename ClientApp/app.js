import Vue from 'vue'
import axios from 'axios'
import router from './router'
import store from './store'
import { sync } from 'vuex-router-sync'
import HangboardTimer from 'components/hangboard-timer'

Vue.prototype.$http = axios;

sync(store, router)

const app = new Vue({
    store,
    router,
    ...HangboardTimer
})

export {
    app,
    router,
    store
}
import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const currentStateDataFormatVersion = '20180429.2';
const localStorageKeyName = 'hanboard-state-' + currentStateDataFormatVersion;

// STATE
let state = null;
if(localStorage && localStorage.getItem(localStorageKeyName)) {
    state = JSON.parse(localStorage.getItem(localStorageKeyName))
} else {
    state = {
        version: currentStateDataFormatVersion,
        isSoundOn: false,
        totalSeconds : {
            rampup: 10,
            work: 10,
            rest: 180
        }
    }
}

// MUTATIONS
const mutations = {
    toggleSound(state) {
        state.isSoundOn = !state.isSoundOn;
    },
    changeTotalSeconds(state, payload) {
        //payload format: { intervalName : 'rampup', totalSeconds : 42 }
        state.totalSeconds[payload.intervalName] = payload.totalSeconds;
    }
}

// ACTIONS
const actions = ({

})

let store = new Vuex.Store({
    state,
    mutations,
    actions
});

store.subscribe((mutation, state) => {
    //NOTE: We persist only the state, not the mutations to avoid having all the ticks keep the data growing over time
	localStorage.setItem(localStorageKeyName, JSON.stringify(state));
})

export default store;

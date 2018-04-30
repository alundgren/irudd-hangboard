<template>
    <div id="app">
        <div id="main">
            <div id="sound">
                <span id="toggleSound" v-on:click="toggleSound()" class="fa" v-bind:class="{ 'fa-bell' : !isSoundOn, 'fa-bell-slash-o' : !isSoundOn, 'fa-bell-o' : isSoundOn }"></span>
            </div>
            <div v-if="runningId" id="time">
                <span class="active" id="sec">{{currentElapsedSecondsFormatted}}</span>
            </div>
            <div id="intervals">
                <div v-on:click="editInterval(i)" v-for="i of intervals" :key="i.name" class="interval" v-bind:class="{ 'active': (runningId && i.index === currentIntervalIndex) }">{{i.name}}&nbsp;<span v-if="!runningId">{{secondsToText(getTotalSecondsByIntervalName(i.name))}}</span></div>
            </div>
            <div id="buttons">
                <span v-if="!runningId && !currentEditInterval" v-on:click="start()" class="fa fa-play fa-2x"></span>
                <span v-if="runningId" v-on:click="reset()" class="fa fa-stop fa-2x"></span>
            </div>
            <div id="workCount">
                {{workCountFormatted}}
            </div>
        </div>
        <div id="overlay" class="overlay" v-if="currentEditInterval">
            <div>
                <span id="overlayText">{{currentEditInterval.intervalName}}</span>
                <span id="closeOverlay" class="fa fa-close" v-on:click="closeEditInterval()"></span>
            </div>
            <div><span id="overlayDisplayValue">{{currentEditInterval.totalSeconds}}</span></div>
            <div><input id="overlayEditValue" v-model="currentEditInterval.totalSeconds" min="1" step="1" max="300" value="" type="range" style="width:100%" ></div>
        </div>
        <audio id='bellAudio' src="../media/boxing-bell.mp3"></audio>
    </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'

export default {    
    data() {
        return {
            runningId : null,
            intervals: [
                { index: 0, name: 'rampup', elapsedSeconds: 0 }, 
                { index: 1, name: 'work', elapsedSeconds: 0}, 
                { index: 2, name: 'rest', elapsedSeconds: 0}
            ],
            currentIntervalIndex: 0,
            workCount: 0,
            currentEditInterval: null
        }
    },
    computed: {
        workCountFormatted() {  
            if(this.workCount == 0) {
                return '';
            } else {
                return '#: ' + (this.workCount < 10 ? '0' : '') + this.workCount.toString()
            }  
        },
        currentElapsedSecondsFormatted() {
            return this.secondsToText(this.intervals[this.currentIntervalIndex].elapsedSeconds);
        },
        ...mapState({
            isSoundOn: state => state.isSoundOn,
            totalSeconds: state => state.totalSeconds
        })        
    },
    methods: {
        formatElapsedSeconds(interval) {  
            return this.secondsToText(this.getTotalSecondsByIntervalName(interval.name) - interval.elapsedSeconds);
        },
        resetCurrent() {
            this.runningId = null;
            this.interval = null;
            this.workCount = null;
        },
        getTotalSecondsByIntervalName(name) {
            return this.totalSeconds[name]
        },
        secondsToText(seconds) {
            let m = (seconds - (seconds % 60)) / 60;
            let s = seconds - 60 * m;
            return (m > 0 ? m + '.' : '') + (s < 10 ? '0' + s : s);
        },
        toggleSound() {            
            this.$store.commit('toggleSound')
        },
        onSwitchInterval(fromInterval, toInterval) {
            if(fromInterval) {
                document.getElementById(fromInterval).classList.remove('active');
            }
            if(toInterval) {
                playSound('bell')
                document.getElementById(toInterval).classList.add('active');
                if(toInterval === 'rest') {
                    current.workCount = current.workCount + 1;
                    updateWorkCountUi(current.workCount);
                }
            }
        },      
        playSound(name) {
            if(!this.isSoundOn) return;
            const audio = document.getElementById('bellAudio');
            if (!audio) return;
            
            audio.currentTime = 0;
            audio.play();
        },
        start() {
            if(this.runningId) {
                window.clearInterval(this.runningId);
                this.runningId = null;
            }
            this.workCount = 0;
            this.currentIntervalIndex = 0;
        
            var startMs = null; 
            let isFirstInterval = true;
            this.runningId = window.setInterval(() => {
                var ms = new Date().getTime();
        
                if(startMs == null) {
                    startMs = ms
                    if(!isFirstInterval) {
                        this.currentIntervalIndex = (this.currentIntervalIndex + 1) % 3;
                        this.playSound();
                    }
                }
                let currentInterval = this.intervals[this.currentIntervalIndex]
                let currentIntervalTotalSeconds = this.getTotalSecondsByIntervalName(currentInterval.name);
                var elapsedMs = ms - startMs;
                var fractionDone = elapsedMs / ((1000 * currentIntervalTotalSeconds));        
                currentInterval.elapsedSeconds = Math.floor(elapsedMs / 1000);
                                
                if(currentInterval.elapsedSeconds >= currentIntervalTotalSeconds) {
                    isFirstInterval = false;
                    startMs = null;
                    if(currentInterval.name == 'work') {
                        this.workCount = this.workCount + 1;
                    }
                }
            }, 50);  
        },
        reset() {
            if(this.runningId) {
                window.clearInterval(this.runningId);
                this.runningId = null;
                this.currentIntervalIndex = 0;
            }
        },
        editInterval(i) {
            this.currentEditInterval = {
                intervalName: i.name,
                totalSeconds: this.getTotalSecondsByIntervalName(i.name)
            }
        },
        closeEditInterval() {
            if(this.currentEditInterval) {
                this.$store.commit({ 
                        type: 'changeTotalSeconds',
                        intervalName : 'rampup', 
                        totalSeconds : parseInt(this.currentEditInterval.totalSeconds) 
                    })                 
            }
            this.currentEditInterval = null;
        }
    }    
}
</script>

<style>
@import url(https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css);
@import url(https://fonts.googleapis.com/css?family=Orbitron:700,900,500,400);
</style>

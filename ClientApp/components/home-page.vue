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
html,
body, #app {
  width: 100%;
  height: 100%;
}
 
body, #app {
  margin: 0;
  padding: 0;
  font-family: 'Orbitron', sans-serif;
  font-weight: 700;
  background: #222;
  color: paleturquoise;
  display: flex;
  align-items: flex-start;
  justify-content: center;
}
 
#main {
  width: 100%;
  height: auto;
}
 
#sound {
  width: 90%;
  margin: 0 auto;
  display: flex;
  margin-top:2em;
  text-align: center;
  align-items: center;
  justify-content: flex-end;  
}
 
#time {
  width: 90%;
  margin-top:2em;
  margin: 0 auto;
  text-align: center;
  font-size: 8em;
  text-shadow: 0px 2px 25px rgba(144, 244, 253, .6);
}
 
#intervals {
  width: 90%;
  margin: 0 auto;
  margin-top:2em;
  display: flex;
  text-align: center;
  align-items: center;
  justify-content: center;
}
 
#intervals span {
  font-size:x-small;
  font-style: italic;
}
 
.none {
  display: none;
}
 
#buttons {
  width: 90%;
  margin: 0 auto;
  margin-top:2em;
  text-align: center;
  font-size: 2.5em;
  text-shadow: 0px 2px 25px rgba(144, 244, 253, .6);
  display:flex;
  justify-content:space-around;
}
 
.interval {
  flex: 1;
  color: #444;
  text-align: center;
}
 
.active {
  color: paleturquoise;
  text-shadow: 0px 2px 25px rgba(144, 244, 253, .6);
}
 
#workCount {
  width: 90%;
  margin: 0 auto;
  margin-top:1em;
  text-align: center;
  font-size: 4em;
  text-shadow: 0px 2px 25px rgba(144, 244, 253, .6);
  display:flex;
  justify-content:space-around;
}
 
/*
begin overlay
*/
.overlay {    
    font-size: 2em;
    box-shadow: inset 0 0 0 1000px rgba(0,0,0,0.8);
    position: absolute;
    top: 15%;
    left: 15%;
    width: 70%;
    height: 50%;
    display:flex;
    justify-content:space-between;
    flex-direction:column;
    box-sizing: border-box;
    padding:1em;
}
 
.overlay div {
  display:flex;
  justify-content: space-between;
}
 
/*Make range inputs invisble*/
.overlay input[type=range] {
  -webkit-appearance: none; /* Hides the slider so that custom slider can be made */
  width: 100%; /* Specific width is required for Firefox. */
  background: transparent; /* Otherwise white in Chrome */
}
 
.overlay input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
}
 
.overlay input[type=range]:focus {
  outline: none; /* Removes the blue border. You should probably do some kind of focus styling for accessibility reasons though. */
}
 
.overlay input[type=range]::-ms-track {
  width: 100%;
  cursor: pointer;
 
  /* Hides the slider so custom styles can be added */
  background: transparent; 
  border-color: transparent;
  color: transparent;
}
/*Thumb*/
input[type=range]::-webkit-slider-thumb {
  -webkit-appearance: none;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: paleturquoise;
  cursor: pointer;
  margin-top: -14px; /* You need to specify a margin in Chrome, but in Firefox and IE it is automatic */
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d; /* Add cool effects to your sliders! */
}
 
/* All the same stuff for Firefox */
input[type=range]::-moz-range-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: paleturquoise;
  cursor: pointer;
}
 
/* All the same stuff for IE */
input[type=range]::-ms-thumb {
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  border: 1px solid #000000;
  height: 36px;
  width: 16px;
  border-radius: 3px;
  background: paleturquoise;
  cursor: pointer;
}
/*Track*/
input[type=range]::-webkit-slider-runnable-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: paleturquoise;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}
 
input[type=range]:focus::-webkit-slider-runnable-track {
  background: paleturquoise;
}
 
input[type=range]::-moz-range-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  background: paleturquoise;
  border-radius: 1.3px;
  border: 0.2px solid #010101;
}
 
input[type=range]::-ms-track {
  width: 100%;
  height: 8.4px;
  cursor: pointer;
  background: transparent;
  border-color: transparent;
  border-width: 16px 0;
  color: transparent;
}
input[type=range]::-ms-fill-lower {
  background: paleturquoise;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type=range]:focus::-ms-fill-lower {
  background: paleturquoise;
}
input[type=range]::-ms-fill-upper {
  background: paleturquoise;
  border: 0.2px solid #010101;
  border-radius: 2.6px;
  box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
}
input[type=range]:focus::-ms-fill-upper {
  background: paleturquoise;
}
/* 
end overlay
*/
</style>

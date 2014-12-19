/*jslint vars: true, plusplus: true, devel: true, nomen: true, maxerr: 50, regexp: true, browser:true */

var audio = (function () {
    'use strict';
    var objects = {
            audioWrappers : document.getElementsByClassName('box-audio')
        },
        humanReadableDuration = function (intDuration) {
            var h,
                m,
                s,
                hour = Math.floor(intDuration / 3600),
                min = Math.floor((intDuration - (hour * 3600)) / 60),
                sec = Math.floor(intDuration - (hour * 3600) - (min * 60));
            
            if (hour > 0) {
                h = (hour < 1) ? '0' + hour : hour;
                h += ':';
            } else {
                h = '';
            }
            m = (min < 10) ? '0' + min : min;
            s = (sec < 10) ? '0' + sec : sec;
            return h + m + ':' + s;
        },
        setBtnPlay = function (button, audio) {
            var fn = function () {
                if (button.classList.contains('play')) {
                    button.classList.remove('play');
                    button.classList.add('pause');
                    button.setAttribute('title', 'Jeda');
                    audio.play();
                } else if (button.classList.contains('replay')) {
                    button.classList.remove('replay');
                    button.classList.add('pause');
                    button.setAttribute('title', 'Putar ulang');
                    audio.currentTime = 0;
                    audio.play();
                } else {
                    button.classList.remove('pause');
                    button.classList.add('play');
                    button.setAttribute('title', 'Putar');
                    audio.pause();
                }
            };
            
            button.addEventListener('click', fn, false);
        },
        setInitialDuration = function (barTime, audio) {
            
            if (isNaN(audio.duration)) {
                barTime.textContent = '';
            } else {
                 
                var fn = function () {
                    barTime.textContent = humanReadableDuration(audio.duration);
                };

                audio.addEventListener('loadedmetadata', fn, false);
            }
        },
        setProgress = function (progressCurrent, progressInput, audio, btnPlay, barTime) {
            var percentage,
                fn = function () {
                    percentage = Math.floor((100 / audio.duration) * audio.currentTime);
                    progressCurrent.style.width = percentage + '%';
                    progressInput.value = percentage;
                    barTime.textContent = humanReadableDuration(audio.duration - audio.currentTime);
                    
                    if (audio.ended) {
                        btnPlay.classList.remove('pause');
                        btnPlay.classList.add('replay');
                        btnPlay.setAttribute('title', 'Putar ulang');
                    }
                    //console.log(humanReadableDuration(audio.duration - audio.currentTime));
                };
            
            audio.addEventListener('timeupdate', fn, false);
        },
        setProgressChange = function (progressInput, audio) {
            var time,
                fn = function () {
                    time = audio.duration * (progressInput.value / 100);
                    audio.currentTime = time;
                };
            
            progressInput.addEventListener('change', fn, false);
        },
        setVolume = function (val, audio) {
            var vol = audio.volume;
            vol = val;
            
            if (vol >= 0 && vol <= 1) {
                audio.volume = vol;
            } else {
                audio.volume = (vol < 0) ? 0 : 1;
            }
        },
        setVolumeChange = function (volumeCurrent, volumeInput, audio, volumeIcon) {
            var vol,
                fn = function () {
                    vol = volumeInput.value / 100;
                    volumeCurrent.style.width = volumeInput.value + '%';
                    audio.volume = vol;
                    volumeInput.setAttribute('value', vol * 100);
                    
                    if (vol > 0) {
                        volumeIcon.classList.remove('mute');
                        volumeIcon.classList.add('unmute');
                    } else {
                        volumeIcon.classList.remove('unmute');
                        volumeIcon.classList.add('mute');
                    }
                };
            
            volumeInput.addEventListener('change', fn, false);
        },
        toggleVolumeMute = function (button, volumeInput, volumeCurrent, audio) {
            var vol,
                fn = function () {
                    vol = parseInt(volumeInput.getAttribute('value'), 10);
                    if (button.classList.contains('mute')) {
                        button.classList.remove('mute');
                        button.classList.add('unmute');
                        audio.volume = vol / 100;
                        volumeCurrent.style.width = vol + '%';
                        volumeInput.value = vol;
                    } else {
                        button.classList.remove('unmute');
                        button.classList.add('mute');
                        audio.volume = 0;
                        volumeCurrent.style.width = 0;
                        volumeInput.value = 0;
                    }
                };
            button.addEventListener('click', fn, false);
        },
        displayControls = function () {
            var parent = objects.audioWrappers,
                parentLen = parent.length,
                i,
                audio,
                controls,
                barTime,
                btnPlay,
                progressWrapper,
                progressCurrent,
                progressInput,
                volumeWrapper,
                volumeIcon,
                volumeCurrent,
                volumeInput;
            
            for (i = 0; i < parentLen; i++) {
                audio = parent[i].getElementsByTagName('audio')[0];
                controls = parent[i].getElementsByClassName('controls')[0];
                btnPlay = document.createElement('div');
                btnPlay.className = 'btn-play play';
                btnPlay.setAttribute('title', 'Putar');
                
                progressWrapper = document.createElement('div');
                progressWrapper.className = 'bar-progress-wrapper';
                progressCurrent = document.createElement('div');
                progressCurrent.className = 'bar-progress-current';
                progressInput = document.createElement('input');
                progressInput.className = 'bar-progress-range';
                progressInput.setAttribute('type', 'range');
                progressInput.setAttribute('value', 0);
                progressWrapper.appendChild(progressCurrent);
                progressWrapper.appendChild(progressInput);
                
                barTime = document.createElement('div');
                barTime.className = 'bar-time';
                barTime.textContent = humanReadableDuration(audio.duration);
                
                volumeWrapper = document.createElement('div');
                volumeWrapper.className = 'volume-wrapper';
                volumeIcon = document.createElement('div');
                volumeIcon.className = 'ico-volume unmute';
                volumeCurrent = document.createElement('div');
                volumeCurrent.className = 'bar-volume-current';
                volumeInput = document.createElement('input');
                volumeInput.className = 'bar-volume-range';
                volumeInput.setAttribute('type', 'range');
                volumeInput.setAttribute('value', 50);
                volumeWrapper.appendChild(volumeIcon);
                volumeWrapper.appendChild(volumeCurrent);
                volumeWrapper.appendChild(volumeInput);
                
                controls.appendChild(btnPlay);
                controls.appendChild(progressWrapper);
                controls.appendChild(barTime);
                if (!navigator.userAgent.match(/iPhone|iPad|iPod/i)) {
                    //hide volume controls in Apple's products for audio's volume is controlled physically by users
                    controls.appendChild(volumeWrapper);
                }
                
                setInitialDuration(barTime, audio);
                setBtnPlay(btnPlay, audio);
                setProgress(progressCurrent, progressInput, audio, btnPlay, barTime);
                setProgressChange(progressInput, audio);
                setVolume(0.5, audio);
                setVolumeChange(volumeCurrent, volumeInput, audio, volumeIcon);
                toggleVolumeMute(volumeIcon, volumeInput, volumeCurrent, audio);
            }
        },
        init = function () {
            displayControls();
        };
    
    
    return {init: init};
}());

window.addEventListener('load', audio.init, false);
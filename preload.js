"use strict";
const { ipcRenderer } = require('electron');

let intervalID = null; 

window.addEventListener('DOMContentLoaded', () => {
    const body = document.getElementsByTagName('body');
    body[0].style.overflow = 'hidden';
    setInterval(() => {
        let gestureModal = document.querySelector("html body div.gesture-modal")
        if(gestureModal) {
            gestureModal.style.display = 'none';
        }
    }, 100);
});

function clickCanvas() {
    document.getElementsByTagName('canvas')[0].click()
}

ipcRenderer.on('no-timeout-true', () => {
    intervalID = setInterval(300000,clickCanvas);
    console.log("click interval set");
})
ipcRenderer.on('no-timeout-false', () => {
    clearInterval(intervalID);
    console.log("click interval clear");
})






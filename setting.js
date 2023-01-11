"use strict";

const {ipcRenderer} = require("electron");

window.addEventListener('DOMContentLoaded', () => {
    const chkAuto = document.getElementById("chkAuto");
    const numHeight = document.getElementById("numHeight");
    const btnExport = document.getElementById("btnExport");

    chkAuto.addEventListener('input', () => {
        if(document.getElementById("chkAuto").checked){
        document.getElementById("numWidth").disabled = true;
        }else {
        document.getElementById("numWidth").disabled = false;
        }
    });

    numHeight.addEventListener('input', () => {
        if(document.getElementById("chkAuto").checked){
            let height = parseInt(document.getElementById("numHeight").value)
            let width = parseInt(height * 16 / 9)
            document.getElementById("numWidth").value = width
        }
    });

    btnExport.addEventListener('click', () => {
        const width = document.getElementById('numWidth').value;
        const height = document.getElementById('numHeight').value;
        const platform = document.getElementById('radioLogin').elements["radioLogin"].value;
        const exdata = `{\n\t"playVersion": "${platform}",\n\t"winHeight": "${height}",\n\t"winWidth": "${width}"\n}`
        ipcRenderer.send('config-save', exdata);
        ipcRenderer.send('close-setting');
    })


})


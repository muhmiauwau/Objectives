import { EventEmitter } from '/lib/eventemitter.js';


export const global_const = {
    MODULE_NAME: 'Objectives',
    LOCALSTORAGE_KEY: 'Objectives_UI',
    STORAGE_KEY: 'Objectives_Store',
    TEMPLATE_PATH: 'third-party/Objectives/templates',
}



export const objEventTypes = {
    APP_READY: 'app_ready',
    WandClicked: 'WandClicked'
}

export const objEventSource = new EventEmitter([objEventTypes.APP_READY]);


export function deMuh(){
    console.log("muh:", ...arguments)
}
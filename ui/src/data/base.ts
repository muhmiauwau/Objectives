import { EventEmitter } from '@angular/core';


// declare const EventEmitter: any;

// 🏛️ Globale Konstanten
const globalConst:any = {
  MODULE_NAME: 'Objectives',
  EXTENTION_NAME: 'Objectives',
  EXTENTION_NAME_LONG: 'SillyTavern-Objectives',
  LOCALSTORAGE_KEY: 'Objectives_UI',
  STORAGE_KEY: 'Objectives_Store',
  TEMPLATE_PATH: 'third-party/Objectives/templates',
};

globalConst["EXTENSION_FOLDER_PATH"] = 'third-party/${EXTENTION_NAME_LONG}/templates'

export const global_const = globalConst

// 📡 Event Types
export const OBJ_EVENT_TYPES = {
  APP_READY: 'app_ready',
  WandClicked: 'WandClicked'
};

// EventEmitter für Objectives Events
export const objEventSource = new EventEmitter<string>();

/**
 * 🐄 Debug Funktion - deMuh
 */
export function deMuh(...args: any[]): void {
  console.log("muh:", ...args);
}

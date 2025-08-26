import { EventEmitter } from '/lib/eventemitter.js';

// declare const EventEmitter: any;

// 🏛️ Globale Konstanten
export const GLOBAL_CONST = {
  MODULE_NAME: 'Objectives',
  LOCALSTORAGE_KEY: 'Objectives_UI',
  STORAGE_KEY: 'Objectives_Store',
  TEMPLATE_PATH: 'third-party/Objectives/templates',
};

// 📡 Event Types
export const OBJ_EVENT_TYPES = {
  APP_READY: 'app_ready',
  WandClicked: 'WandClicked'
};

// EventEmitter für Objectives Events
// export const objEventSource = new EventEmitter([OBJ_EVENT_TYPES.APP_READY]);

/**
 * 🐄 Debug Funktion - deMuh
 */
export function deMuh(...args: any[]): void {
  console.log("muh:", ...args);
}

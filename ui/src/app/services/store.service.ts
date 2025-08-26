import { Injectable } from '@angular/core';
import { GLOBAL_CONST } from './base.service';
import * as _ from 'lodash-es';
// SillyTavern APIs - diese sind global verfügbar
// declare const SillyTavern: any;
// declare const chat_metadata: any;
// declare const extension_settings: any;
// declare const saveMetadataDebounced: () => void;
// declare const saveSettingsDebounced: () => void;


// const { lodash} = SillyTavern.libs;
// const _ = lodash


// import { chat_metadata, saveSettingsDebounced, extension_prompt_roles } from '/script.js';
// import { extension_settings, getContext, saveMetadataDebounced } from '/scripts/extensions.js';


const DEFAULT_SETTINGS = {
  tasks: {},
  objectives: [],
  checkFrequency: 3,
  injectionFrequency: 3,
};

const DEFAULT_UI = {
  isExpanded: false,
  showCompleted: false
};

/**
 * 🏪 StoreService - Angular Service für SillyTavern Integration
 * Ersetzt store.js 1:1 mit echten SillyTavern APIs
 */
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  
//   get(key: string): any {
//     if (!chat_metadata[GLOBAL_CONST.STORAGE_KEY]) {
//       chat_metadata[GLOBAL_CONST.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
//     }
//     return _.get(chat_metadata[GLOBAL_CONST.STORAGE_KEY], key);
//   }
  
//   set(key: string, value: any): void {
//     if (!chat_metadata[GLOBAL_CONST.STORAGE_KEY]) {
//       chat_metadata[GLOBAL_CONST.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
//     }
//     _.set(chat_metadata[GLOBAL_CONST.STORAGE_KEY], key, value);
//     console.log("##dd## set", this.get(key));
//     saveMetadataDebounced();
//   }
  
//   getUI(key: string): any {
//     const ui = JSON.parse(localStorage.getItem(GLOBAL_CONST.LOCALSTORAGE_KEY) || '{}');
//     return ui[key] ?? (DEFAULT_UI as any)[key];
//   }
  
//   setUI(key: string, value: any): void {
//     const ui = JSON.parse(localStorage.getItem(GLOBAL_CONST.LOCALSTORAGE_KEY) || '{}');
//     ui[key] = value;
//     localStorage.setItem(GLOBAL_CONST.LOCALSTORAGE_KEY, JSON.stringify(ui));
//   }
  
//   getExt(key: string): any {
//     if (!extension_settings[GLOBAL_CONST.MODULE_NAME]) {
//       extension_settings[GLOBAL_CONST.MODULE_NAME] = {};
//     }
//     return extension_settings[GLOBAL_CONST.MODULE_NAME][key];
//   }
  
//   setExt(key: string, value: any): void {
//     if (!extension_settings[GLOBAL_CONST.MODULE_NAME]) {
//       extension_settings[GLOBAL_CONST.MODULE_NAME] = {};
//     }
//     extension_settings[GLOBAL_CONST.MODULE_NAME][key] = value;
//     saveSettingsDebounced();
//   }
  
//   reset(): void {
//     delete chat_metadata[GLOBAL_CONST.STORAGE_KEY];
//     localStorage.removeItem(GLOBAL_CONST.LOCALSTORAGE_KEY);
//   }
}
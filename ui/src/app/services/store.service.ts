import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';


import { GLOBAL_CONST } from 'data/base';
import { chatMetadata, saveMetadata, saveSettingsDebounced, extensionSettings } from 'data/SillyTavern';


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
// const {chat_metadata} = window.SillyTavern.getContext() 

/**
 * 🏪 StoreService - Angular Service für SillyTavern Integration
 * Ersetzt store.js 1:1 mit echten SillyTavern APIs
 */
@Injectable({
  providedIn: 'root'
})
export class StoreService {
  // @ts-ignore
  
  
  get(key: string): any {
    if (!chatMetadata[GLOBAL_CONST.STORAGE_KEY]) {
      chatMetadata[GLOBAL_CONST.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
    }
    return _.get(chatMetadata[GLOBAL_CONST.STORAGE_KEY], key);
  }
  
  set(key: string, value: any): void {
    if (!chatMetadata[GLOBAL_CONST.STORAGE_KEY]) {
      chatMetadata[GLOBAL_CONST.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
    }
    _.set(chatMetadata[GLOBAL_CONST.STORAGE_KEY], key, value);
    console.log("##dd## set", this.get(key));
    saveMetadata();
  }
  
  getUI(key: string): any {
    const ui = JSON.parse(localStorage.getItem(GLOBAL_CONST.LOCALSTORAGE_KEY) || '{}');
    return ui[key] ?? (DEFAULT_UI as any)[key];
  }
  
  setUI(key: string, value: any): void {
    const ui = JSON.parse(localStorage.getItem(GLOBAL_CONST.LOCALSTORAGE_KEY) || '{}');
    ui[key] = value;
    localStorage.setItem(GLOBAL_CONST.LOCALSTORAGE_KEY, JSON.stringify(ui));
  }
  
  getExt(key: string): any {
    if (!extensionSettings[GLOBAL_CONST.MODULE_NAME]) {
      extensionSettings[GLOBAL_CONST.MODULE_NAME] = {};
    }
    return extensionSettings[GLOBAL_CONST.MODULE_NAME][key];
  }
  
  setExt(key: string, value: any): void {
    if (!extensionSettings[GLOBAL_CONST.MODULE_NAME]) {
      extensionSettings[GLOBAL_CONST.MODULE_NAME] = {};
    }
    extensionSettings[GLOBAL_CONST.MODULE_NAME][key] = value;
    saveSettingsDebounced();
  }

}
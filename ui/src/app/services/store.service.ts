import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';


import { global_const } from 'data/base';
import ST from 'data/SillyTavern';


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
  
  get(key: string): any {
    if (!ST().chatMetadata[global_const.STORAGE_KEY]) {
      ST().chatMetadata[global_const.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
    }
    return _.get(ST().chatMetadata[global_const.STORAGE_KEY], key);
  }

  set(key: string, value: any): void {
    if (!ST().chatMetadata[global_const.STORAGE_KEY]) {
      ST().chatMetadata[global_const.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
    }
    _.set(ST().chatMetadata[global_const.STORAGE_KEY], key, value);
    console.log("##dd## set", this.get(key));
    ST().saveMetadata();
  }

  getUI(key: string): any {
    const ui = JSON.parse(localStorage.getItem(global_const.LOCALSTORAGE_KEY) || '{}');
    return ui[key] ?? (DEFAULT_UI as any)[key];
  }

  setUI(key: string, value: any): void {
    const ui = JSON.parse(localStorage.getItem(global_const.LOCALSTORAGE_KEY) || '{}');
    ui[key] = value;
    localStorage.setItem(global_const.LOCALSTORAGE_KEY, JSON.stringify(ui));
  }

  getExt(key: string): any {
    if (!ST().extensionSettings[global_const.MODULE_NAME]) {
      ST().extensionSettings[global_const.MODULE_NAME] = {};
    }
    return ST().extensionSettings[global_const.MODULE_NAME][key];
  }

  setExt(key: string, value: any): void {
    if (!ST().extensionSettings[global_const.MODULE_NAME]) {
      ST().extensionSettings[global_const.MODULE_NAME] = {};
    }
    ST().extensionSettings[global_const.MODULE_NAME][key] = value;
    ST().saveSettingsDebounced();
  }

}
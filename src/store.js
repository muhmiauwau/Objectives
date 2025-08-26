const { lodash } = SillyTavern.libs;
const _ = lodash
import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';
import { chat_metadata, saveSettingsDebounced, extension_prompt_roles } from '/script.js';
import { extension_settings, getContext, saveMetadataDebounced } from '/scripts/extensions.js';


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

export class Store {
    
    get(key) {
        if (!chat_metadata[global_const.STORAGE_KEY]) chat_metadata[global_const.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
        return _.get(chat_metadata[global_const.STORAGE_KEY], key);
    }
    
    set(key, value) {
        // chat_metadata[global_const.STORAGE_KEY] = { ...DEFAULT_SETTINGS }
        if (!chat_metadata[global_const.STORAGE_KEY]) chat_metadata[global_const.STORAGE_KEY] = { ...DEFAULT_SETTINGS };
        _.set(chat_metadata[global_const.STORAGE_KEY], key, value);

         console.log("##dd## set",this.get(key))
        saveMetadataDebounced()
    }
    
    getUI(key) {
        const ui = JSON.parse(localStorage.getItem(global_const.LOCALSTORAGE_KEY) || '{}');
        return ui[key] ?? DEFAULT_UI[key];
    }
    
    setUI(key, value) {
        const ui = JSON.parse(localStorage.getItem(global_const.LOCALSTORAGE_KEY) || '{}');
        ui[key] = value;
        localStorage.setItem(global_const.LOCALSTORAGE_KEY, JSON.stringify(ui));
    }
    
    getExt(key) {
        if (!extension_settings[global_const.MODULE_NAME]) extension_settings[global_const.MODULE_NAME] = {};
        return extension_settings[global_const.MODULE_NAME][key];
    }
    
    setExt(key, value) {
        if (!extension_settings[global_const.MODULE_NAME]) extension_settings[global_const.MODULE_NAME] = {};
        extension_settings[global_const.MODULE_NAME][key] = value;
        saveSettingsDebounced();
    }
    
    reset() {
        delete chat_metadata[global_const.STORAGE_KEY];
        localStorage.removeItem(global_const.LOCALSTORAGE_KEY);
    }
}

export const store = new Store();
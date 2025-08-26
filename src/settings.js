const { lodash } = SillyTavern.libs;
const _ = lodash
import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';
import { extension_settings, renderExtensionTemplateAsync } from '/scripts/extensions.js';

import { store }  from './store.js';

const settingsConfig = {
    id: `${global_const.MODULE_NAME}Settings_container`,
    title: `${global_const.MODULE_NAME}`,
    desc: `${global_const.MODULE_NAME}`,
    sliders: [
        {
            id: `${global_const.MODULE_NAME}sliders_TaskInjectionFrequency`,
            label: `Task Injection Frequency`,
            value: 1,
            min: 1,
            max: 30,
            desc: "messages between task injections"
        },
        {
            id: `${global_const.MODULE_NAME}sliders_TaskCheckFrequency`,
            label: `Task Check Frequency`,
            value: 1,
            min: 0,
            max: 30,
            desc: "messages between task checks, 0 = disabled"
        }
    ],
    btnRow1: [
        {
            id: `${global_const.MODULE_NAME}btnRow1_managePrompts`,
            icon: "terminal",
            label: `Manage Prompts`
        },
        {
            id: `${global_const.MODULE_NAME}btnRow1_manageTemplates`,
            icon: "file",
            label: `Manage Templates`
        }
    ],
    btnRow2: [
        {
            id: `${global_const.MODULE_NAME}btnRow2_export`,
            icon: "file-export",
            label: `Export Tasks`
        },
        {
            id: `${global_const.MODULE_NAME}btnRow2_Import`,
            icon: "file-import",
            label: `Import Tasks`
        },
        {
            id: `${global_const.MODULE_NAME}btnRow2_statistics`,
            icon: "chart-simple",
            label: `Statistics`
        }
    ]
}


export async function initSettings(){
    store.setExt("test", "lala")
    const settingsHtml = await renderExtensionTemplateAsync(global_const.TEMPLATE_PATH, 'settings', settingsConfig);
    $('#extensions_settings').append(settingsHtml);

    
     _.forEach(settingsConfig.sliders, (entry) =>{
         $(document).on("input", `#${entry.id} input`, async (e,b,c) => {
            // deMuh(`change #${entry.id}`,  $(e.target).val(), e,b,c)

            const value = $(e.target).val()
            $(e.target).siblings().val(value)
        })
    })



    _.forEach([...settingsConfig.btnRow1, ...settingsConfig.btnRow2], (entry) =>{
         $(document).on("click", `#${entry.id}`, async () => {
            // deMuh(`clicked #${entry.id}`)
        })
    })

}





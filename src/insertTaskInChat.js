const { lodash } = SillyTavern.libs;
const _ = lodash

import { global_const, objEventSource, objEventTypes, deMuh }  from './base.js';

// // import { chat_metadata, saveSettingsDebounced, is_send_press, extension_prompt_types, extension_prompt_roles } from '../../../../script.js';
// // import { getContext, extension_settings, saveMetadataDebounced, renderExtensionTemplateAsync } from '../../../extensions.js';
import {
    substituteParams,
    eventSource,
    event_types,
    generateQuietPrompt,
    animation_duration,
} from '/script.js';
// // import { waitUntilCondition } from '../../../utils.js';
// // import { is_group_generating, selected_group } from '../../../group-chats.js';
// // import { dragElement } from '../../../../scripts/RossAscends-mods.js';
// // import { loadMovingUIState } from '../../../../scripts/power-user.js';
// // import { callGenericPopup, Popup, POPUP_TYPE } from '../../../popup.js';
import { oai_settings } from '/scripts/openai.js';

const currentTask = "Wichtig: our current task is [Stehe auf einen Bein]. Egal was du in moment machst, du musst diesen task ausführen. "



let dryRun;

 export function loadInsertInChat(){


    eventSource.on(event_types.GENERATE_AFTER_COMBINE_PROMPTS, (data) => {
       console.debug(data)
       dryRun = data.dryRun

    });



    function extractNameFromContent(macroName, lastContent, groupNudgePrompt) {

        const hasUser = !!(groupNudgePrompt.match(/(\{\{user\}\})/g));
        const hasChar = !!(groupNudgePrompt.match(/(\{\{char\}\})/g));  
        let pattern = groupNudgePrompt
            .replace(/[.*+?^${}()|[\]\\]/g, '\\$&') 

        if(hasUser){
            pattern = pattern.replaceAll(/(\\{\\{user\\}\\})/g, '(.+?)')
        }
        if(hasChar){
            pattern = pattern.replaceAll(/(\\{\\{char\\}\\})/g, '(.+?)')
        }
 

        const match = lastContent.match(new RegExp(pattern));
        return match ? match[1] : null;
    }


    eventSource.on(event_types.GENERATE_AFTER_DATA, (payload) => {

        let isImpersonationPrompt = false
        let isContinuePrompt = false
        let isgroupPrompt = false
     

        // test()/
        if(!_.isArray(payload.prompt)) return;
        const length = payload.prompt.length - 1
        const last = payload.prompt[length];
        
        if(last?.role === "system"){

            let impersonationPrompt = oai_settings.impersonation_prompt || "-";
            impersonationPrompt = impersonationPrompt.substring(0, impersonationPrompt.indexOf("{"));

            let continuePrompt = oai_settings.continue_nudge_prompt || "-";
            continuePrompt = continuePrompt.substring(0, continuePrompt.indexOf("{"));

            let groupPrompt = oai_settings.group_nudge_prompt || "-";
            groupPrompt = groupPrompt.substring(0, groupPrompt.indexOf("{"));

            let next = ""
            if (last.content.startsWith(impersonationPrompt)) {
                const name = extractNameFromContent("char", last.content, oai_settings.impersonation_prompt);
                isImpersonationPrompt = true
                next = `user:${name} next `
            }else if (last.content.startsWith(groupPrompt)) {
                const name = extractNameFromContent("char", last.content, oai_settings.group_nudge_prompt);
                isgroupPrompt = true
                next = `assistant:${name} next `
            }else if (last.content.startsWith(continuePrompt)) {
                const last = payload.prompt[length -1];
                isContinuePrompt = true
                next = last.role + " next "
            }



            // last.content = currentTask + last.content
            //    payload.prompt.push({
            //     role: 'system',
            //     content: next + currentTask
            // });

          

            
            

            if(next == "user:Lara next "){
                deMuh("---", window.task)
                payload.prompt.push({
                    role: 'system',
                    content:`Wichtig: our current task is [${window.task}]. Egal was du in moment machst, du musst diesen task ausführen. `
                });
            }

        }else{
            // last.content = currentTask + last.content
            // payload.prompt.push({
            //     role: 'system',
            //     content: "assistant next " + currentTask
            // });
        }

        // deMuh('GENERATE_AFTER_DATA ok :', payload.prompt,  isImpersonationPrompt,isContinuePrompt);

    });
}
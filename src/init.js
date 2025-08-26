const { lodash } = SillyTavern.libs;
const _ = lodash

import { deMuh } from './debug.js';
import { global_const }  from './base.js';

import { loadInsertInChat }  from './insertTaskInChat.js';

import { initSettings }  from './settings.js';
import { initWand }  from './wand.js';

import { store }  from './store.js';
import { initPanel }  from './panel.js';

// Angular Custom Elements Helper
// import { createObjectivesPanel, createObjectivesSettings, areCustomElementsReady } from './angularElements.js';

import { ConnectionManagerRequestService } from '/scripts/extensions/shared.js';

async function test(){
    
    deMuh("######### test")
    // Profile abrufen
    const profiles = ConnectionManagerRequestService.getSupportedProfiles();

    deMuh("######### profiles",profiles)

    const find = _.find(profiles, (entry)=> (entry.name == "objectives api"))
     deMuh("######### find",find)

     if (find){


        const task = "sie soll lachen"
        const msg = `Mira: (lache leise auf während ich mich wieder aufrichte) Okay, vielleicht sollte ich das doch lieber auf dem Boden üben...
(gehe zu dir und setze mich neben dich, immer noch ein bisschen kichernd) Du hättest mein Gesicht sehen sollen! Total überrascht und dann dieses kleine "whoops"`

        const response = await ConnectionManagerRequestService.sendRequest(
            find.id,
            `${msg}\nTask: ${task}\nHas the task been completed? Answer only 'true' or 'false'.`,
            4048,
            {
                stream: false,
                raw: true,
                signal: null,
                extractData: false,
                includePreset: false,
                includeInstruct: false,
            },
            { 
                stream: false,
                num_ctx: 1, 
                options:{
                    stream: false,
                    temperature: 0
                }
            }
        );

        const res = (response?.choices[0]?.text || "").trim().toLowerCase()

        deMuh("######### antwort",profiles, res,  response)

     }




}

export async function init() {

    // Lade externe Libraries
    // jQuery('body').append(`<script src="/scripts/extensions/third-party/Objectives/libs/sugar.min.js"></script><script src="/scripts/extensions/third-party/Objectives/libs/jquerymy.min.js"></script>`);
    
    initWand()
    // loadInsertInChat()
    // initSettings()
    // initPanel()

    



    
    const bla = setInterval(() => { 
        $(".recentChat:first-child").click()
        // console.clear()
        // $= jQuery
    }, 100);

        

    setTimeout(() => {
        deMuh("#########, clearInterval")
        clearInterval(bla)
        $('#movingDivs').append('<objectives-panel></objectives-panel>');
       
    }, 3000)
}



import { Component, signal, effect, Signal } from '@angular/core';
import { global_const } from 'data/base';
import ST from 'data/SillyTavern';
const { eventSource, event_types, ConnectionManagerRequestService } = ST();
import * as _ from 'lodash-es';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [],
  templateUrl: './settings.html',
  styleUrl: './settings.less',
})
export class Settings {
  title = global_const.MODULE_NAME;

  isNarrating: boolean = false;
  // simple promise-controller to delay generation until other code resolves it
  blockPromise: Promise<void> | null = new Promise<void>((resolve) => {
    this.blockResolve = resolve;
  });
  private blockResolve: any = () => {};

  narratorMessage: any = {};

  getNarratorForId(id: number) {
    // console.log('✅ ✅ getNarratorForId');
    // return ST().chat[id].narrator
    // ST().chat
  }

  async saveNarratorForId(id: number, str: string) {
    // this.narratorMessage = {id, mes}

    const orgMsg: any = ST().chat[id];

    const naratorMsg = {
      ...orgMsg,
      name: 'Narrator',
      mes: str,
    };
    naratorMsg.extra = {};
    naratorMsg.extra.isSmallSys = true;
    naratorMsg.is_user = true;
    // naratorMsg.is_system = true
    // naratorMsg

    await ST().chat.push(naratorMsg);

    await ST().saveChat();

    this.narratorMessage = { id, str, naratorMsg };
    console.log('✅ ✅ saveNarratorForId', id, str, naratorMsg);
  }

  async setNarratorForId(id1: any) {
    const { id, str, naratorMsg } = this.narratorMessage;
    if (!id) return;
    console.log('✅ ✅ setNarratorForId', id, id1);
    await ST().reloadCurrentChat();
  }

  constructor() {
    eventSource.on(event_types.USER_MESSAGE_RENDERED, async (id: number, type: any) => {
      console.log('✅ ✅ USER_MESSAGE_RENDERED', id, type);
      await this.setNarratorForId(id);
      // await ST().reloadCurrentChat();

      // _.debounce(()=>{ ST().reloadCurrentChat()} , 200)
    });

    eventSource.on(event_types.CHARACTER_MESSAGE_RENDERED, async (data: any, type: any) => {
      //  _.debounce(()=>{ ST().reloadCurrentChat()} , 200)
      // await ST().reloadCurrentChat();
      // if (type == 'inpersonate') return;
      // console.clear();
      // console.log('✅ ✅ USER_MESSAGE_RENDERED', data, type);
      //  const narratorMsg:string= `${data}: lalalaal jahdksad`
      // this.setNarratorForId(data, narratorMsg);
    });

    eventSource.on(event_types.MESSAGE_RECEIVED, async (data: any, type: any) => {
      // await ST().reloadCurrentChat();
    }); //MESSAGE_SWIPED

    // eventSource.on(event_types.MESSAGE_DELETED, (data: any, type: any) => {
    // }); //MESSAGE_SWIPED

    // eventSource.on(event_types.CHAT_CHANGED, (data: any, a: any) => {

    //   //@ts-ignore
    //   const $msgs = jQuery(`#chat .mes`)
    //   console.log('✅ ✅ CHAT_CHANGED', $msgs)

    //   $msgs.each((key:any,value:any) => {

    //     //@ts-ignore
    //     const ele = $(value)
    //     // if(ele.attr("ch_name") == "Narrator"){
    //     //   ele.find(".mesAvatarWrapper,.mes_block .flex-container.flex1.alignitemscenter * ").remove()
    //     // }

    //   });
    // });

    eventSource.on(event_types.CHAT_COMPLETION_PROMPT_READY, async (event: any) => {
      if (event.dryRun) return;
      console.log('✅ Final Prompt', event, event.chat, ST().chat);
      // event.chat = await this.runNarration(event.chat)
      // await this.blockPromise

      //  console.log('✅ Final Prompt After promise', event, event.chat, ST().chat)
    });

    eventSource.on(event_types.MESSAGE_SENT, async (data: any) => {
      console.log('✅ MESSAGE_SENT', data);
      // if(dryRun) return;
      await this.runNarration();
    });

    // eventSource.on(event_types.GENERATE_BEFORE_COMBINE_PROMPTS, (data: any, a: any) => {
    //   console.log('✅ ✅ GENERATE_BEFORE_COMBINE_PROMPTS', data, a);
    // });

    // ST().eventSource.on(ST().event_types.GENERATE_BEFORE_COMBINE_PROMPTS, (data: any, a: any) => {
    //   console.log('✅ ✅ GENERATE_AFTER_COMBINE_PROMPTS', data, a);
    // });

    // ST().eventSource.on(ST().event_types.GENERATE_AFTER_COMBINE_PROMPTS, (data: any, a: any) => {
    //   console.log('✅ ✅ GENERATE_AFTER_COMBINE_PROMPTS', data, a);
    // });
  }

  isGenerationTypeAllowed(type: any) {
    if (ST().groupId) {
      if (type !== 'normal' && type !== 'group_chat') {
        return false;
      }
    } else {
      if (type) {
        return false;
      }
    }

    return true;
  }

  async runNarration() {
    //@ts-ignore
    const id = jQuery(`#chat .mes:not([ch_name="Narrator"]`).last().attr('mesid');

    console.log('✅ Delaying generation for', 1, 'seconds', id);

    // const naratingmsg= `${id}: jashdjksadh`
    //              await this.saveNarratorForId(id, naratingmsg)
    //  return

    const profiles = ConnectionManagerRequestService.getSupportedProfiles();

    console.log('######### profiles', profiles);

    // const pro = "objectives narrator api"
    const pro = 'objectives api deepseek';
    const find = _.find(profiles, (entry) => entry.name == pro);
    console.log('######### find', find);

    // const last = chat.at(-1)

    console.log('✅ Delaying Finisch', 1, 'seconds', id);

    if (find) {
      let msgs: any = [];

      const chatArray = Object.values(ST().chat);
      chatArray.forEach((entry: any) => {
        if (entry.is_system) return;
        console.log(entry);
        msgs.push(`${entry.name}:${entry.mes}`);
      });
      const lastmsg = msgs.at(-1);

      msgs.join('\n');

      const triggerMap:any = {
        newscene: {
          hint: 'If the conversation contains an action or dialogue that clearly and definitively ends the current social interaction (e.g., saying goodbye and walking away, leaving a room, abruptly ending the conversation, falling asleep). This signals that the current scene is narratively complete and a new narrative unit begins.',
          example: 'The scene is complete',
          prompt: `Du bist ein neutraler Erzähler. Basierend auf dem Chatverlauf und der letzten Nachricht, beschreibe kurz und neutral in der dritten Person den Übergang zu einer neuen Szene (z.B. Zeitverlauf oder Ortswechsel). Vermeide jegliche Handlungen oder Beschreibungen von User oder Charakteren. Halte es rein narrativ und kontextuell.`
        },
        location: {
          hint: 'when the current location should be described',
          example: 'The current location was not described.',
        },
        cloths_user: {
          hint: "Wenn die Kleidung des Users für eine bevorstehende oder aktuelle Handlung relevant ist (z.B. wird berührt, verändert oder entfernt) und noch nicht beschrieben wurde.",
          example: "Die Kleidung des Users wurde nicht erwähnt.",
          prompt: `
Du bist ein neutraler Erzähler. Beschreibe ausschließlich die Kleidung von {{user}}, sofern sie für die aktuelle oder bevorstehende Handlung relevant und bisher nicht beschrieben ist. Falls sich der User an- oder auszieht, liste alle Kleidungsstücke einzeln und sachlich für den Zustand davor und danach auf. Verwende keine Sammelbezeichnungen wie „Rest“ oder „weitere Kleidungsstücke“. Wenn Kleidungsstücke nicht im Chat erwähnt wurden, ergänze sie möglichst präzise und vollständig anhand des Kontexts oder allgemeiner Erwartungen (z.B. Unterwäsche, Hose, Socken, Schuhe). Nutze das folgende Format:

Kleidung des Users (vorher):

- Kleidungsstück 1: kurze detailierte Beschreibung
- Kleidungsstück 2: kurze detailierte Beschreibung
...

Kleidung des Users (nachher):

- Kleidungsstück 1: kurze detailierte Beschreibung
- Kleidungsstück 2: kurze detailierte Beschreibung
...

Füge keine Handlungen, Bewertungen oder Charakterbeschreibungen hinzu. Bleibe rein sachlich und kontextuell.
`  },
        cloths_char: {
          hint: "when a character's clothing is relevant for an imminent action (e.g., being touched, modified, or removed) but has not been described yet",
          example: "The character's clothing is missing.",
          prompt: `Du bist ein neutraler Erzähler. Prüfe anhand des Chatverlaufs und der letzten Nachricht, ob die Kleidung des char für die aktuelle oder bevorstehende Handlung relevant ist. Falls ja, beschreibe sie kurz und neutral in der dritten Person. Vermeide jegliche Handlungen, Bewertungen oder Beschreibungen von User oder Charakteren. Halte die Beschreibung rein sachlich und kontextuell, ohne auf Gedanken, Gefühle oder Absichten einzugehen.`
        },
        atmosphere: {
          hint: 'when the mood/atmosphere should be described',
          example: 'The atmosphere of the scene should be emphasized.',
        },
        action: {
          hint: 'when an action should be described in more detail',
          example: 'The plot needs more details.',
        },
      };
      const themesList = Object.keys(triggerMap)
    .map((key:string) => `  - ${key} (${triggerMap[key].hint})`)
    .join('\n');

    const themesExamples = Object.keys(triggerMap)
    .map((key:string) => `  - ${key} (${triggerMap[key].example})`)
    .join('\n');

// console.log(ST().substituteParamsExtended?.("User: {{user}}"))


      const analysePrompt = `
        History: [${lastmsg}]
        Last message: [${lastmsg}]

        You are an experienced conversation analyst.
        Your task:
        1. Analyze the last message in the chat history.
        2. Examine the previous history.
        3. Decide if any of the following aspects are missing or should be described:

        Possible topics (use only these exact labels):
        ${themesList}

        Response format: [Topic,Topic,...]
        If no intervention is necessary, reply with "false".
      

        Example responses:
        ${themesList}
        - false

        user == "{{user}}" 
        char == "{{char}}"


      `;

      

      

      async function callAPi(mode:string){
        //@ts-ignore
        toastr.info(`callAPi: ${mode}`, "objectives");
       
        const prefix= `Verlauf: [${msgs}]
        Letzte Nachricht: [${lastmsg}]
        
      `
        let prompt =""
     
       if(Object.keys(triggerMap).includes(mode)){
           prompt += triggerMap[mode].prompt
        }else{
          prompt += analysePrompt
        }

         prompt = ST().substituteParamsExtended(prompt)


         console.log('######### callAPi prompt', prompt);

         prompt = `${prefix}\n\n${prompt}`

      
          //  console.log('######### ',mode, Object.keys(triggerMap), Object.keys(triggerMap).includes(mode));


        const response = await ConnectionManagerRequestService.sendRequest(
          find.id,
          prompt,
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
            options: {
              stream: false,
              temperature: 0.2,
              max_tokens: 300,
              presence_penalty: 0,
              frequency_penalty: 0,
              top_p: 1,
            },
          }
        );

        const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || '')
          .trim()
          .toLowerCase();

           console.log('######### callAPi', profiles, res, response);

           //@ts-ignore
        toastr.info(`callAPi result: ${res}`, "objectives");
          return res

      }


      

      const analyseResult = await callAPi("init")
      if(analyseResult !== "false"){
        let naratingmsg = analyseResult;
        for (const trigger of Object.keys(triggerMap)) {
          if (analyseResult.includes(trigger)) {
            naratingmsg = await callAPi(trigger);
            break; // Nur den ersten gefundenen Trigger behandeln
          }
        }

      

        await this.saveNarratorForId(id, `(Erzähler)(${analyseResult})\n ${naratingmsg}`);
      }
    }
  }
}

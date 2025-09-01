import { Injectable, signal, effect,inject } from '@angular/core';
import * as _ from 'lodash-es';
import { TrackerStatusService } from 'services/tracker-status.service';
import { trackerUserPromptTemplate,trackerFullSystemPromptTemplate, trackerSystemPromptTemplate, generateRequestPrompt } from 'data/narrator';

import ST from 'data/SillyTavern';

@Injectable({
  providedIn: 'root',
})

export class TrackerService {
  trackerStatusService = inject(TrackerStatusService);
  update: any = signal(false);
  tracker: any = signal(false);
  panelTracker: any = signal(null);

  
  constructor() {
    console.log('TrackerService constructor');
    const { eventSource, event_types } = ST();

    effect(async () => {
      const update = this.update();
      if (update) {
        console.count('TrackerService');
        console.log('TrackerService updatesavechat', update);

        const chatEntry = ST().chat.at(update.id)
        const tracker = update.tracker
        const msg = update.tracker.newscene
        chatEntry.tracker =  tracker
        chatEntry.mes = msg
        await ST().saveChat();


      }
    });

    eventSource.on(event_types.CHAT_CHANGED, async (data: any) => {
      this.onChatChange(data)

    });
  }

   async onChatChange(data: any){
    const id = _.size(ST().chat)-1
      this.panelTracker.set({ id, tracker: {} });

      let tracker:any = await this.getCurrentTracker();
      if (!tracker) return;
      console.log('TrackerService CHAT_CHANGED', data, tracker);
      
      if(_.size(tracker) == 0){
        this.trackerStatusService.set(id, "fullGen")
           await new Promise(r => setTimeout(r, 200000));
        console.log('TrackerService CHAT_CHANGED', "no tracker present generate new one");
        tracker = await this.generateFullTracker()
        const entry = ST().chat.at(-1)
        _.set(entry, ["tracker"], tracker)
        console.log('TrackerService CHAT_CHANGED', "no tracker present generate new one", tracker);
        if(_.size(tracker) == 0) return;
        
         await ST().saveChat();
      }

      await new Promise(r => setTimeout(r, 200000));

      
      this.panelTracker.set({
       id,
        tracker: tracker,
      });

      this.update.set({
        id,
        tracker: tracker,
      })

      this.trackerStatusService.set(id, "done")
   }



  async getCurrentTracker(): Promise<any> {
    const chat = { ...ST().chat };
    const chatId = ST().chatId;
    if (!chatId) return false;

    if (_.size(chat) == 0) {
      await new Promise((r) => setTimeout(r, 100));
      return this.getCurrentTracker();
    }

    const filtered: any = _.filter(chat, (entry: any) => {
      return _.has(entry, ['narratorObj', 'tracker']);
    });

    console.assert(filtered, 'getCurrentTracker:_ no narratorObj found');
    if (!filtered) return {};

    const lastEntry: any = _.last(filtered);
    console.assert(lastEntry, 'getCurrentTracker: no lastEntry found', chat);
    if (!lastEntry) return {};

    return lastEntry.narratorObj.tracker;
  }









  async callAPI(prompt:any){
    const { ConnectionManagerRequestService } = ST();


    //  const pro = 'objectives api deepseek';
    const pro = 'openrouter - narrator 2';
    const profiles = ConnectionManagerRequestService.getSupportedProfiles();
    const find = _.find(profiles, (entry) => entry.name == pro);
    console.log('Profile find', find);

    if(!find) return false;
      console.time(`callTracker`);
      console.log("callTracker prompt", prompt);
      const startTime = performance.now()
      const response = await ConnectionManagerRequestService.sendRequest(
        find.id,
        prompt,
        8000,
        {
          stream: false,
          signal: null,
          extractData: false,
          includePreset: false,
          includeInstruct: false,
          instructSettings: {},
        },
        {
          options: {
            // temperature: 0.2,
            // max_tokens: 300,
            // presence_penalty: 0,
            // frequency_penalty: 0,
            // top_p: 1,
          },
        }
      );

      /*
        inception/mercury 
          128K
          16.4K
          $0,25
          $1
          Fast but no cache

      */



        console.log('######### callAPi before', response);
      const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || '')
        .trim()
        .toLowerCase();

      function calcTime(startTime:any, endTime:any, usage:any){
        const ms = endTime - startTime
      
        console.assert(usage.completion_tokens, "calcTime: mising usage.completion_tokens")
        const token =  usage.completion_tokens
        const seconds = ms / 1000; // Convert ms to seconds first
        const result = (token / seconds).toFixed(2); // tokens per second
        const secondsFormatted = seconds.toFixed(2);


        return `CallTracker tokens: ${token} time: ${secondsFormatted}s , rate: ${result} TPS `
      }

      console.log('######### callAPi', profiles, res, response); 
      const endTime = performance.now()
      console.timeEnd(`callTracker`);
      console.warn(calcTime(startTime, endTime, response.usage))
      console.warn("callAPi", response.usage) 
      
      

      return res;
    }


  async generateFullTracker() {

    const chat = _.map(ST().chat, (msg:any) =>{
        return {
          role: (msg.is_user)? "user": "assistant",
          content: ST().substituteParamsExtended(`${((msg.is_user)? "{{user}}": "{{char}}")}: ${msg.mes}`)
        }
    })

    const prompt = [
      {
          role: "system",
          content: ST().substituteParamsExtended(trackerFullSystemPromptTemplate)
        },
        ...chat,
        {
            role: "system",
            content: generateRequestPrompt 
        }
    ]


    const tracker = await this.callAPI(prompt)
    return this.parseAPIResult(tracker)
  }

  parseAPIResult(tracker: string): any{
    let newTracker;
    try {
      // if(extensionSettings.trackerFormat == trackerFormat.JSON) tracker = unescapeJsonString(tracker);
      const trackerContent = tracker.match(/<(?:tracker|Tracker)>([\s\S]*?)<\/(?:tracker|Tracker)>/);
      let result:any = trackerContent ? trackerContent[1].trim() : null;
      // @ts-ignore
      result = window.Objectives.yamlToJSON(result);
      newTracker = JSON.parse(result);
    } catch (e) {
      console.log("Failed to parse tracker:", tracker, e);
      // toastr.error("Failed to parse the generated tracker. Make sure your token count is not low or set the response length override.");
    }
    return newTracker || false;
  }



}

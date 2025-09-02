import { Injectable, signal, effect, inject } from '@angular/core';
import * as _ from 'lodash-es';
import { TrackerStatusService } from 'services/tracker-status.service';
import {
  trackerUserPromptTemplate,
  trackerFullSystemPromptTemplate,
  trackerSystemPromptTemplate,
  generateRequestPrompt,
  trackerAnalysePrompt,
  trackerPromptMap,
  singleStepPrompt
} from 'data/narrator';

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
    // console.log('TrackerService constructor');
    const { eventSource, event_types } = ST();

    effect(async () => {
      const update = this.update();
      if (update) {
        // console.count('TrackerService');
        // console.log('TrackerService updatesavechat', update);

        const chatEntry = ST().chat.at(update.id);
        const tracker = update.tracker;
        const msg = update.tracker.newscene;
        chatEntry.tracker = tracker;
        chatEntry.mes = msg;
        await ST().saveChat();
      }
    });

    eventSource.on(event_types.CHAT_CREATED, async (data: any) => {
      // this.onChatChange(data)

      // this.panelTracker.set({ id: 1, tracker: {} });
      // console.log('TrackerService CHAT_CREATED', data);
      this.onChatChange(data, true);
    });
    eventSource.on(event_types.CHAT_CHANGED, async (data: any) => {
      // console.log('TrackerService CHAT_CHANGED', data, !ST().chatMetadata.tainted);

      if (!ST().chatMetadata.tainted) {
        this.onChatChange(data, false);
      }
    });
  }

  async onChatChange(data: any, freshChat: boolean) {
    const id = _.size(ST().chat);
    // console.log('TrackerService onChatChange freshChat', freshChat);

    let tracker = {};
    if (freshChat) {
      setTimeout(() => {
        this.trackerStatusService.setAndUpdate(id, 'fullGen');
      }, 20);

      // console.log('TrackerService onChatChange', 'no tracker present generate new one');
      tracker = await this.generateFullTracker();
      const entry = ST().chat.at(-1);
      _.set(entry, ['tracker'], tracker);
      // console.log('TrackerService onChatChange', 'no tracker present generate new one', tracker);
      if (_.size(tracker) == 0) return;

     
      this.update.set({
        id,
        tracker: tracker,
      });

  

      this.trackerStatusService.setAndUpdate(id, 'done');
     
       await ST().saveChat();

    } else {

        const tracker = this.getLast()
  
        this.panelTracker.set({
          id: id -1,
          tracker: tracker,
        });

        // console.log('TrackerService onChatChange ',tracker);

     }
  }

  get(id: number) {
    return ST().chat.at(id).tracker || false;
  }

  async saveTracker(id: number, tracker: any) {
    const entry = ST().chat.at(id)
    entry.tracker = tracker
    entry.mes = tracker.newscene
    await ST().saveChat();
    return true
  }

  async getCurrentTracker(chatId: string = ''): Promise<any> {
    // console.log('TrackerService getCurrentTracker', chatId, ST().chatId);
    // return;
    const chat = { ...ST().chat };
    chatId = ST().chatId;
    if (!chatId) return false;

    if (_.size(chat) == 0) {
      await new Promise((r) => setTimeout(r, 100));
      return this.getCurrentTracker();
    }

    const filtered: any = _.filter(chat, (entry: any) => {
      return _.has(entry, ['tracker']);
    });

    console.assert(filtered, 'getCurrentTracker:_ no narratorObj found');
    if (!filtered) return {};

    const lastEntry: any = _.last(filtered);
    console.assert(lastEntry, 'getCurrentTracker: no lastEntry found', chat);
    if (!lastEntry) return {};

    return lastEntry.tracker;
  }



  getChatHistory(){
    return  _.map(ST().chat, (msg: any) => {
      return {
        role: msg.is_user ? 'user' : 'assistant',
        content: ST().substituteParamsExtended(
          `${msg.is_user ? '{{user}}' : '{{char}}'}: ${msg.mes}`
        ),
      };
    });
  }

  getLastMessage(){
    const lastMsg =  _.filter(ST().chat, (entry: any) => entry.name != "Narrator").at(-1);
    return `${lastMsg.name}: ${lastMsg.mes}`
  }

  getLast(){
    const entry =  _.last(_.filter(ST().chat, (entry: any) => (entry.name == "Narrator" && _.size(entry.tracker) > 0)))
    return entry.tracker || {}
  }




  extractShortKey(longKey: string): string {
    const parts = longKey.split('.');
    if (parts.length <= 2) return longKey;
    // Nimmt das erste, jedes mit geradem Index ab 2 und das letzte Segment
    const shortParts = [parts[0]];
    for (let i = 2; i < parts.length - 1; i += 2) {
      shortParts.push(parts[i]);
    }
    shortParts.push(parts[parts.length - 1]);
    return shortParts.join('.');
  }


  
  getFieldPrompts(){

    return trackerPromptMap

  }





  // #region segmentedTracker
  async segmentedTracker(id:number) {
    const currentTracker = this.getLast()
    const newTracker = structuredClone(currentTracker)
    const fieldsPrompts = this.getFieldPrompts();
    this.trackerStatusService.setAndUpdate(id, 'analyse');

    const analyseResult =  await this.analyseStep(currentTracker)

    // const analyseResult = {data: ['location', 'characters.lara.postureandinteraction']}

    if(analyseResult && analyseResult.data){
      console.log("segmentedTracker analyseResult", analyseResult.data);
      this.trackerStatusService.setAndUpdate(id, 'genFields');


      // Alle Promises parallel starten
      const results = await Promise.all(
        analyseResult.data.map((key:string) => {
            return this.singleStep(key, currentTracker, fieldsPrompts)
        })
      );

      

      // Ergebnisse in stepsResults einsortieren
      const stepsResults: Record<string, unknown> = {};
      analyseResult.data.forEach((key:string, idx:number) => {
        stepsResults[key] = results[idx];
        _.set(newTracker, key, results[idx])
      });

      console.log("segmentedTracker analyseResult stepsResults",analyseResult.data,  stepsResults, newTracker);
      
    }
    this.trackerStatusService.setAndUpdate(id, 'done');
    return newTracker
  }


 











  async analyseStep(currentTracker: any) {
    const trackerHistoryMsg = this.getChatHistory()
    const trackerLastMsg = this.getLastMessage()
    const currentTrackerStr = JSON.stringify(currentTracker)

    console.log("segmentedTracker analyseStep", currentTracker)

    const prompt = [
      {
        role: 'system',
        content: ST().substituteParamsExtended(trackerAnalysePrompt(currentTracker), {trackerLastMsg,  currentTracker: currentTrackerStr}),
      },
    ];

    const result = await this.callAPI(prompt, {
      temperature: 0.1,
      max_tokens: 100,
    });

    console.log("segmentedTracker analyseStep", trackerLastMsg, prompt, result)
     return JSON.parse(result)
  }




  getExtraSingleStepContext(key:string, currentTracker: any) {
    
    const contextMap = {
      "stateofdress" : ["outfit"],
      "locationofoutfititems" : ["outfit"],
      "stateofoutfititems" : ["outfit"]
    }
    
    const sKey:any = key.split(".").at(-1)

    const path:any = _.initial(key.split("."))

    if(path[0] == 'characters'){
      function capitalizeFirstLetter(val:string) {
          return String(val).charAt(0).toUpperCase() + String(val).slice(1);
      }
      path[1] = capitalizeFirstLetter(path[1])
    }
    
    

    const context = _.get(contextMap, sKey, false)

    if(!context) return "";

    const extras:any = []
    context.forEach((element:string) => {
      const extra = _.get(currentTracker, [...path, element], false)
      if(extra){
        extras.push(`\n ${element}: [${extra}]`)
      }
      
    });


    return `## Extra Context:
      ${extras.join("")}
    `

  }





  async singleStep(key:string, currentTracker: any, fieldsPrompts:any) {

    const fieldCharacterspresent = (currentTracker["characterspresent"] || []).join(",")
    
    const fieldExtraContext = this.getExtraSingleStepContext(key, currentTracker)
   

    const currentValue = JSON.stringify({data: _.get(currentTracker, key)})

    const promptObj = _.get(fieldsPrompts, this.extractShortKey(key))

    const fieldKey =  key.split(".").at(-1)
    const fieldExamples = promptObj.exampleValues
    const fieldPrompt = promptObj.prompt

    if(!promptObj) return;

    const trackerLastMsg = this.getLastMessage()
 
    const content = ST().substituteParamsExtended(singleStepPrompt, {
      fieldKey,
      fieldExtraContext,
      fieldCharacterspresent, 
      fieldExamples,
      fieldPrompt, 
      trackerLastMsg,  
      currentValue
    })


    const prompt = [
      {
        role: 'system',
        content
       }
    ];


    const result = await this.callAPI(prompt, {
      temperature: 0.1,
      max_tokens: 100,
    });

    const res = JSON.parse(result)

    console.log(`segmentedTracker singleStep - ${key} -`, trackerLastMsg, prompt, res.data)
     return res.data
  }












































































  // async generateFullTracker() {
  //   const chat = this.getChatHistory()

  //   const prompt = [
  //     {
  //       role: 'user',
  //       content: ST().substituteParamsExtended(trackerFullSystemPromptTemplate),
  //     },
  //     ...chat,

  //   ];

  //   const tracker = await this.callAPI(prompt);
  //   return this.parseAPIResult(tracker);
  // }


  async generateFullTracker() {

    const chat = this.getChatHistory()

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


    const tracker = await this.callAPI(prompt, {
      temperature: 0.1,
      max_tokens: 2000,
    });
    return this.parseAPIResult(tracker)
  }





  async callAPI(prompt: any, customOptions?: any) {
    const { ConnectionManagerRequestService } = ST();

    // #region callAPI
    //  const pro = 'objectives api deepseek';
    
    const pro = 'openrouter - narrator 4'; 
    const profiles = ConnectionManagerRequestService.getSupportedProfiles();
    const find = _.find(profiles, (entry) => entry.name == pro);
    // console.log('Profile find', find);

    if (!find) return false;
    // console.log('callTracker prompt', prompt);
    const startTime = performance.now();
    const response = await ConnectionManagerRequestService.sendRequest(
      find.id,
      prompt,
      customOptions?.max_tokens ?? 300,
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
          temperature: customOptions?.temperature ?? 0.2,
          max_tokens: customOptions?.max_tokens ?? 300,
          presence_penalty: 0,
          frequency_penalty: 0,
          top_p: 1,
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

    // console.log('######### callAPi before', response);
    const res = (response?.choices[0]?.text || response?.choices[0]?.message.content || '').trim()

    function calcTime(startTime: any, endTime: any, usage: any) {
      const ms = endTime - startTime;

      console.assert(usage.completion_tokens, 'calcTime: mising usage.completion_tokens');
      const token = usage.completion_tokens;
      const seconds = ms / 1000; // Convert ms to seconds first
      const result = (token / seconds).toFixed(2); // tokens per second
      const secondsFormatted = seconds.toFixed(2);

      return `CallTracker tokens: ${token} time: ${secondsFormatted}s , rate: ${result} TPS `;
    }

    // console.log('######### callAPi', profiles, res, response);
    const endTime = performance.now();
    console.warn(calcTime(startTime, endTime, response.usage));
    console.warn('callAPi', response.usage);

    return res;
  }



  parseAPIResult(tracker: string): any {
    let newTracker;
    try {
      // @ts-ignore
      if(true) tracker = window.Objectives.unescapeJsonString(tracker);
      const trackerContent = tracker.match(
        /<(?:tracker|Tracker)>([\s\S]*?)<\/(?:tracker|Tracker)>/
      );
      let result: any = trackerContent ? trackerContent[1].trim() : null;
      // @ts-ignore
      // result = window.Objectives.yamlToJSON(result);
      newTracker = JSON.parse(result);
    } catch (e) {
      console.log('Failed to parse tracker:', tracker, e);
      // toastr.error("Failed to parse the generated tracker. Make sure your token count is not low or set the response length override.");
    }
    return newTracker || false;
  }
}

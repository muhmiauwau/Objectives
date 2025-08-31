import { Injectable, signal } from '@angular/core';
import * as _ from 'lodash-es';

import { trackerUserPromptTemplate, trackerSystemPromptTemplate } from 'data/narrator';

import ST from 'data/SillyTavern';

@Injectable({
  providedIn: 'root',
})
export class TrackerService {
  // tracker: any = signal(false);
  panelTracker: any = signal(null);





  constructor(){
    console.count("TrackerService")
    console.log("TrackerService constructor")
     const { eventSource, event_types } = ST();


    eventSource.on(event_types.CHAT_CHANGED,async (data: any) => {

      const tracker =  await this.getCurrentTracker()
      if(!tracker) return;
        console.log("TrackerService CHAT_CHANGED", data)
      this.panelTracker.set({
        id: -1,
        tracker: tracker
      })

      // const last:any =  _.findLast(Object.values(ST().chat), (entry:any) => {
      //   return entry.name == "Narrator"
      // })

      // const chat = ST().chat
      // // @ts-ignore
      // $(`#chat .mes[ch_name="Narrator"]`).each((key, element:any) => {
      //   console.log(element)
      //   //@ts-ignore
      //   const $element = $(element)
      //   const narratorObj = chat.at($element.attr("mesid")).narratorObj
      //   this.insertElement($element, narratorObj, "done")
      // });
    });
  }





  async getCurrentTracker():Promise<any> {
    const chat = {...ST().chat}
    const chatId = ST().chatId
    if(!chatId) return false;

    if(_.size(chat) == 0){
      await new Promise(r => setTimeout(r, 100));
      return this.getCurrentTracker()
    }

    const filtered: any = _.filter(chat, (entry: any) =>{
      return _.has(entry,["narratorObj", "tracker"])
    })

    console.assert(filtered, "getCurrentTracker:_ no narratorObj found")
    if(!filtered) return {};

    const lastEntry:any = _.last(filtered)
    console.assert(lastEntry, "getCurrentTracker: no lastEntry found", chat)
    if(!lastEntry) return {};

    return lastEntry.narratorObj.tracker
  }




}

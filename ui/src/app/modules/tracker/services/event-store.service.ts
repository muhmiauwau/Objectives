import { Injectable } from '@angular/core';
import * as _ from 'lodash-es';
import { ChronoEventStore } from "chrono-event-store";

import ST from 'data/SillyTavern';
const { eventSource, event_types } = ST();

export interface ChronoChangeSet {
  mesId: number;
  changes: Record<string, any>;
  event?: string;
  active?: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class EventStoreService {

  private store:any;
  private storeKey:string = "objectives_tracker_store"


  init(){
    console.warn("EventStoreService, init")

    // console.log("ssss")
    // chronoEventStore
  
    //  eventSource.on(event_types.CHAT_CREATED, async (data: any) => {
    //   console.warn('EventStoreService CHAT_CREATED', data);
      
    // });
    eventSource.on(event_types.CHAT_CHANGED, async (chatId: string) => {
      if(!chatId) return;
      console.warn('EventStoreService CHAT_CHANGED', chatId, ST().chatMetadata);

      this.addDemodata() // use demodata util we have a function for store them
      this.load()
       console.log(this.store.resolveState(100000))
    });
  }


  load(){
    const chatMetadata = ST().chatMetadata[this.storeKey]
    const storeData = chatMetadata?.data || {}
    const initMesId = chatMetadata?.mesId || 0

    const changeSet:any = []
    ST().chat.forEach((mes:any) => {
      if(mes[this.storeKey]){
        changeSet.push(mes[this.storeKey]) 
      }
    });

    this.store = new ChronoEventStore(initMesId, storeData, changeSet);


    //@ts-ignore
    window.tests = this.store
  }


  add(mesId:number, changes: any){
    this.store.addChangeSet({mesId, changes});
    this.saveToChat(mesId, changes)
  }

  update(mesId:number, changes: any){
    this.store.editChangeSet({mesId, changes});
    this.saveToChat(mesId, changes)
  }

  get(mesId:number){
    return this.store.resolveState(mesId)
  }

  delete(mesId:number){
    this.store.deleteChangeSet(mesId);
  }


  private saveToChat(mesId:number, changes: any){
    const chatEntry = ST().chat.at(mesId);
    chatEntry[this.storeKey] = changes
  }




  addDemodata(){

    const data = {
        "newscene": "",
        "time": "15:00:00; 09/01/2005 (Sunday)",
        "background": "A school changing room with rows of wooden benches and metal lockers. The floor is tiled, and the walls are painted in a neutral color. Fluorescent lights illuminate the room.",
        "weather": "Sunny, warm day",
        "topics": {
            "primarytopic": "Introduction",
            "emotionaltone": "Confident",
            "interactiontheme": "Flirtatious"
        },
        "characterspresent": [
            "Lara",
            "Elena"
        ],
        "characters": {
            "Lara": {
                "hair": "Long brown hair",
                "makeup": "None",
                "outfit": [
                    "White T-shirt",
                    "Black shorts",
                    "White sports bra",
                    "White panties",
                    "Socks"
                ],
                "stateofdress": "Sneakers removed, White T-shirt already removed and placed on the bench",
                "postureandinteraction": "Standing near Elena, looking at her with interest",
                "mood": "Curious",
                "locationofoutfititems": [
                    "White T-shirt,removed,on bench",
                    "Sneakers,removed,unknown"
                ],
                "stateofoutfititems": [
                    "White T-shirt,dirty",
                    "Black shorts,",
                    "White sports bra,",
                    "White panties,",
                    "Sneakers,off"
                ]
            },
            "Elena": {
                "hair": "Brown, shoulder-length, wavy",
                "makeup": "None",
                "outfit": [
                    "Fitted tank top, slightly damp with sweat",
                    "Athletic shorts",
                    "Black sports bra",
                    "Black athletic panties",
                    "Sneakers"
                ],
                "stateofdress": "Top removed, revealing sports bra, standing confidently",
                "postureandinteraction": "Standing still, grinning at Lara, having removed her top",
                "mood": "Confident",
                "locationofoutfititems": [
                    "Tank top,removed,on bench"
                ],
                "stateofoutfititems": [
                    "Tank top,damp with sweat"
                ]
            }
        },
        "location": "Changing room, Gymnasium, Munich, Bavaria",
        "moonphase": "Waxing Crescent"
    }

    const id = 0

    ST().chatMetadata[this.storeKey] = {id,data}
  }
 
}
